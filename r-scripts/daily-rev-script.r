# Load required libraries
library(dplyr)
library(lubridate)
library(jsonlite)
library(tidyr)

# --- 1. Read CSV ---
data <- read.csv("data/daily_transactions_cleaned.csv", stringsAsFactors = FALSE)

# Ensure proper date format and keep only the date
data$date_time <- as.Date(mdy_hm(data$date_time))

# --- 2. Aggregate revenue per branch per day ---
daily_revenue <- data %>%
  group_by(date_time, branch_id) %>%
  summarise(revenue = sum(revenue), .groups = "drop") %>%
  pivot_wider(names_from = branch_id, values_from = revenue, values_fill = 0) %>%
  arrange(date_time) %>%
  rename(
    SMVal = SMV,
    Val = VAL,
    SMGra = SMG
  )

# Optional: compute total revenue per day
daily_revenue <- daily_revenue %>%
  mutate(total = SMVal + Val + SMGra)

# --- 3. Add formatted date column ---
daily_revenue$date <- format(daily_revenue$date_time, "%b %d")  # e.g., "Aug 15"

# --- 4. Select and order columns ---
daily_revenue <- daily_revenue %>%
  select(date, SMVal, Val, SMGra, total)

# --- 5. Export JSON ---

write_json(daily_revenue, "public/output/daily_revenue.json", pretty = TRUE)

cat("✅ JSON exported to output/daily_revenue/daily_revenue.json\n")
