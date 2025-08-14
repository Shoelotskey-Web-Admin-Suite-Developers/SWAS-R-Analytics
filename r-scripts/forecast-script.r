library(dplyr)
library(lubridate)
library(forecast)
library(jsonlite)
library(tidyr)

# --- 1. Read CSV ---
data <- read.csv("data/daily_transactions_may15_aug15_2025.csv", stringsAsFactors = FALSE)

# Parse date_time (adjust depending on your CSV format)
data$date_time <- mdy_hm(data$date_time)   # or ymd_hm/as.POSIXct if needed
data$date <- as.Date(data$date_time)       # keep only the date

# --- 2. Aggregate revenue per branch per day ---
daily <- data %>%
  group_by(date, branch_id) %>%
  summarise(revenue = sum(revenue), .groups = "drop") %>%
  pivot_wider(names_from = branch_id, values_from = revenue, values_fill = 0) %>%
  arrange(date)

# Rename columns to match chart keys
daily <- daily %>%
  rename(
    SMVal = SMV,
    Val = VAL,
    SMGra = SMG
  )

# --- 3. Forecast next 7 days for each branch ---
forecast_branch <- function(series, h = 7) {
  ts_data <- ts(series, frequency = 7)
  fit <- auto.arima(ts_data)
  fc <- forecast(fit, h = h)
  as.numeric(fc$mean)
}

fc_days <- 7
SMValFC <- forecast_branch(daily$SMVal, fc_days)
ValFC   <- forecast_branch(daily$Val, fc_days)
SMGraFC <- forecast_branch(daily$SMGra, fc_days)

# --- 4. Prepare forecast dates ---
last_date <- max(daily$date)
fc_dates <- seq.Date(from = last_date + 1, by = "day", length.out = fc_days)

# --- 5. Prepare JSON outputs ---

# Past totals only
totals_data <- daily %>%
  mutate(total = SMVal + Val + SMGra) %>%
  select(date, SMVal, Val, SMGra, total)

# Forecast only
forecast_data <- data.frame(
  date = fc_dates,
  SMValFC = SMValFC,
  ValFC = ValFC,
  SMGraFC = SMGraFC,
  totalFC = SMValFC + ValFC + SMGraFC
)

# --- 6. Export JSON ---
if(!dir.exists("output")) dir.create("output")

write_json(totals_data, "output/daily_revenue_totals.json", pretty = TRUE)
write_json(forecast_data, "output/daily_revenue_forecast.json", pretty = TRUE)

cat("✅ JSON exported:\n")
cat("- output/daily_revenue_totals.json\n")
cat("- output/daily_revenue_forecast.json\n")
