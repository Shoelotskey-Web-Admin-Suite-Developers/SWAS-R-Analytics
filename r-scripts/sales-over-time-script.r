library(dplyr)
library(lubridate)
library(tidyr)
library(jsonlite)

# --- 1. Read daily transactions ---
daily_data <- read.csv("data/daily_transactions_cleaned.csv", stringsAsFactors = FALSE)
daily_data$date_time <- mdy_hm(daily_data$date_time)   # parse month-day-year hour:minute
daily_data$date <- as.Date(daily_data$date_time)

# --- 2. Aggregate daily totals per branch ---
daily_totals <- daily_data %>%
  group_by(date, branch_id) %>%
  summarise(revenue = sum(revenue), .groups = "drop") %>%
  pivot_wider(names_from = branch_id, values_from = revenue, values_fill = 0) %>%
  rename(SMVal = SMV, Val = VAL, SMGra = SMG) %>%
  mutate(total = SMVal + Val + SMGra) %>%
  arrange(date)

# --- 3. Save daily totals to JSON ---
if(!dir.exists("output")) dir.create("output")
write_json(daily_totals, "public/output/sales_over_time.json", pretty = TRUE)

cat("✅ Daily revenue totals saved to output/sales_over_time.json\n")
