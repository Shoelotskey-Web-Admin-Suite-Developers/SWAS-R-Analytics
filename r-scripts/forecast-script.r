library(dplyr)
library(lubridate)
library(tidyr)
library(jsonlite)
library(prophet)  # <-- Prophet library

# --- 1. Read CSV ---
data <- read.csv("data/daily_transactions_cleaned.csv", stringsAsFactors = FALSE)

# Ensure proper date format and keep only the date
data$date_time <- as.Date(mdy_hm(data$date_time))

# --- 2. Aggregate revenue per branch per day ---
daily <- data %>%
  group_by(date_time, branch_id) %>%
  summarise(revenue = sum(revenue), .groups = "drop") %>%
  pivot_wider(names_from = branch_id, values_from = revenue, values_fill = 0) %>%
  arrange(date_time) %>%
  rename(
    SMVal = SMV,
    Val = VAL,
    SMGra = SMG
  )

# --- 3. Forecast next 14 days using Prophet ---
forecast_branch <- function(series, dates, h = 14) {
  df <- data.frame(ds = dates, y = series)
  m <- prophet(df, daily.seasonality = TRUE, weekly.seasonality = TRUE, yearly.seasonality = FALSE)
  future <- make_future_dataframe(m, periods = h)
  fc <- predict(m, future)
  tail(fc$yhat, h)  # get the last h predicted values
}

fc_days <- 14
last_date <- max(daily$date_time)

SMValFC <- forecast_branch(daily$SMVal, daily$date_time, fc_days)
ValFC   <- forecast_branch(daily$Val, daily$date_time, fc_days)
SMGraFC <- forecast_branch(daily$SMGra, daily$date_time, fc_days)

# --- 4. Prepare forecast dates ---
fc_dates <- seq.Date(from = last_date + 1, by = "day", length.out = fc_days)
fc_dates_formatted <- format(fc_dates, "%b %d")  # e.g., "Aug 16"

# --- 5. Prepare forecast data frame only ---
forecast_data <- data.frame(
  date = fc_dates_formatted,
  SMValFC = SMValFC,
  ValFC = ValFC,
  SMGraFC = SMGraFC
)

# --- 6. Export JSON ---
write_json(forecast_data, "public/output/daily_revenue_forecast.json", pretty = TRUE)

cat("✅ JSON exported to public/output/daily_revenue_forecast.json\n")
