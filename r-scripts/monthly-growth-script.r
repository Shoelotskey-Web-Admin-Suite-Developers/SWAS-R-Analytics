library(dplyr)
library(lubridate)
library(jsonlite)
library(tidyr)

# --- 1. Read daily transactions ---
daily_data <- read.csv("data/daily_transactions_may15_aug15_2025.csv", stringsAsFactors = FALSE)
daily_data$date_time <- mdy_hm(daily_data$date_time)
daily_data$date <- as.Date(daily_data$date_time)

# --- 2. Aggregate daily totals per branch ---
daily_totals <- daily_data %>%
  group_by(date, branch_id) %>%
  summarise(revenue = sum(revenue), .groups = "drop") %>%
  pivot_wider(names_from = branch_id, values_from = revenue, values_fill = 0) %>%
  rename(SMVal = SMV, Val = VAL, SMGra = SMG) %>%
  arrange(date)

# --- 3. Convert daily totals to monthly totals ---
daily_totals$month <- format(daily_totals$date, "%Y-%m")
monthly_totals <- daily_totals %>%
  group_by(month) %>%
  summarise(
    SMVal = sum(SMVal),
    Val = sum(Val),
    SMGra = sum(SMGra),
    .groups = "drop"
  ) %>%
  mutate(total = SMVal + Val + SMGra)

# --- 4. Generate placeholder data for Jan–Apr 2025 ---
all_months <- data.frame(
  month = format(seq.Date(as.Date("2025-01-01"), as.Date("2025-08-01"), by = "month"), "%Y-%m")
)

monthly_totals_full <- all_months %>%
  left_join(monthly_totals, by = "month") %>%
  mutate(
    SMVal = ifelse(is.na(SMVal), 0, SMVal),
    Val = ifelse(is.na(Val), 0, Val),
    SMGra = ifelse(is.na(SMGra), 0, SMGra),
    total = SMVal + Val + SMGra
  )

# --- 5. Apply monthly growth if growth file exists ---
# Example growth file: data/monthly_growth.csv with columns: month, SMV_growth, VAL_growth, SMG_growth
if(file.exists("data/monthly_growth.csv")){
  growth <- read.csv("data/monthly_growth.csv", stringsAsFactors = FALSE)
  
  monthly_totals_full <- monthly_totals_full %>%
    left_join(growth, by = "month") %>%
    mutate(
      SMVal = ifelse(!is.na(SMV_growth), SMVal * SMV_growth, SMVal),
      Val   = ifelse(!is.na(VAL_growth), Val * VAL_growth, Val),
      SMGra = ifelse(!is.na(SMG_growth), SMGra * SMG_growth, SMGra),
      total = SMVal + Val + SMGra
    ) %>%
    select(month, SMVal, Val, SMGra, total)
}

# --- 6. Export JSON ---
if(!dir.exists("output")) dir.create("output")
write_json(monthly_totals_full, "output/monthly_revenue_totals.json", pretty = TRUE)

cat("✅ Monthly totals exported to output/monthly_revenue_totals.json\n")
