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

# --- 5. If JSON exists, only replace the last 2 months + current month ---
output_path <- "public/output/monthly_totals_full.json"
if (file.exists(output_path)) {
  existing_data <- fromJSON(output_path)

  # Identify months to overwrite
  current_month <- floor_date(Sys.Date(), "month")
  months_to_replace <- format(seq(current_month %m-% months(2), current_month, by = "month"), "%Y-%m")

  # Filter old data, keeping only months not in the replacement list
  existing_data <- existing_data %>% filter(!month %in% months_to_replace)

  # Filter new monthly data for replacement months only
  new_data <- monthly_totals_full %>% filter(month %in% months_to_replace)

  # Append new months to old data & sort
  monthly_totals_full <- bind_rows(existing_data, new_data) %>%
    arrange(month)
}

# --- 6. Export JSON ---
if (!dir.exists("public/output")) dir.create("public/output", recursive = TRUE)
write_json(monthly_totals_full, output_path, pretty = TRUE)

cat("📄 Output file updated:", output_path, "\n")
