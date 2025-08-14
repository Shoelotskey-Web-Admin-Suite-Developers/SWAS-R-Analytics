# Load required libraries
library(dplyr)
library(lubridate)
library(forecast)
library(jsonlite)
library(tidyr)

# --- 1. Read CSV ---
# Replace with your CSV file path
data <- read.csv("data/daily_transactions_may15_aug15_2025.csv", stringsAsFactors = FALSE)

# Ensure date format
data$date_time <- mdy_hm(data$date_time)  # month/day/year format

# --- 2. Aggregate revenue per branch per day ---
daily <- data %>%
  group_by(date_time, branch_id) %>%
  summarise(revenue = sum(revenue), .groups = "drop") %>%
  pivot_wider(names_from = branch_id, values_from = revenue, values_fill = 0) %>%
  arrange(date_time)

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

# Forecast for each branch
fc_days <- 7
SMValFC <- forecast_branch(daily$SMVal, fc_days)
ValFC   <- forecast_branch(daily$Val, fc_days)
SMGraFC <- forecast_branch(daily$SMGra, fc_days)

# --- 4. Prepare forecast dates ---
last_date <- max(daily$date_time)
fc_dates <- seq.Date(from = last_date + 1, by = "day", length.out = fc_days)

# --- 5. Combine actual and forecast data ---
actual_data <- daily %>%
  mutate(
    SMValFC = NA,
    ValFC = NA,
    SMGraFC = NA,
    total = SMVal + Val + SMGra,
    totalFC = NA
  )

forecast_data <- data.frame(
  date_time = fc_dates,
  SMVal = NA,
  Val = NA,
  SMGra = NA,
  SMValFC = SMValFC,
  ValFC = ValFC,
  SMGraFC = SMGraFC,
  total = NA,
  totalFC = SMValFC + ValFC + SMGraFC
)

# Combine actual + forecast
chart_data <- bind_rows(actual_data, forecast_data)

# Format date as in your React chart (e.g., "May 31")
chart_data$date <- format(chart_data$date_time, "%b %d")

# Select and order columns as needed
chart_data <- chart_data %>%
  select(
    date, SMVal, SMValFC, Val, ValFC, SMGra, SMGraFC, total, totalFC
  )

# --- 6. Export JSON ---
write_json(chart_data, "output/daily_revenue_forecast.json", pretty = TRUE)

cat("✅ JSON exported to daily_revenue_forecast.json\n")
