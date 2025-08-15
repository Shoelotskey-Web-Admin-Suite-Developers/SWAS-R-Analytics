library(dplyr)
library(lubridate)
library(forecast)
library(jsonlite)
library(tidyr)

# --- 1. Read CSV ---
data <- read.csv("data/daily_transactions_cleaned.csv", stringsAsFactors = FALSE)

# Ensure proper date format and keep only the date
data$date_time <- as.Date(mdy_hm(data$date_time))

# --- 2. Aggregate revenue per branch per day ---
daily <- data %>%
  group_by(date, branch_id) %>%
  summarise(revenue = sum(revenue), .groups = "drop") %>%
  pivot_wider(names_from = branch_id, values_from = revenue, values_fill = 0) %>%
  arrange(date_time) %>%
  rename(
    SMVal = SMV,
    Val = VAL,
    SMGra = SMG
  )

# --- 3. Forecast next 14 days for each branch ---
forecast_branch <- function(series, h = 14) {
  ts_data <- ts(series, frequency = 7)
  fit <- auto.arima(ts_data)
  fc <- forecast(fit, h = h)
  as.numeric(fc$mean)
}

fc_days <- 14
SMValFC <- forecast_branch(daily$SMVal, fc_days)
ValFC   <- forecast_branch(daily$Val, fc_days)
SMGraFC <- forecast_branch(daily$SMGra, fc_days)

# --- 4. Prepare forecast dates ---
last_date <- max(daily$date)
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
write_json(forecast_data, "r-scripts/output/daily_revenue_forecast.json", pretty = TRUE)

cat("✅ JSON exported to r-scripts/output/daily_revenue_forecast.json\n")
