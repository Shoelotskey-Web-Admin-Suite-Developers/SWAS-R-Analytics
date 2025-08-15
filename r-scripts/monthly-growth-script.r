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

# --- 3. Determine months to update (last 2 + current month) ---
daily_totals$month <- format(daily_totals$date, "%Y-%m")
latest_month <- max(daily_totals$month)
previous_month <- format(as.Date(paste0(latest_month, "-01")) %m-% months(1), "%Y-%m")
two_months_ago <- format(as.Date(paste0(latest_month, "-01")) %m-% months(2), "%Y-%m")

months_to_update <- c(two_months_ago, previous_month, latest_month)

# --- 4. Aggregate only those months ---
monthly_totals_update <- daily_totals %>%
  filter(month %in% months_to_update) %>%
  group_by(month) %>%
  summarise(
    SMVal = sum(SMVal),
    Val   = sum(Val),
    SMGra = sum(SMGra),
    .groups = "drop"
  ) %>%
  mutate(total = SMVal + Val + SMGra)

# --- 5. Load or initialize monthly totals file ---
json_file <- "output/monthly_revenue_totals.json"
current_year <- year(Sys.Date())

if(file.exists(json_file)){
  monthly_totals_full <- fromJSON(json_file) %>% as.data.frame()

  # Find the highest year present in existing data or daily data
  last_existing_month <- max(monthly_totals_full$month)
  last_existing_date <- as.Date(paste0(last_existing_month, "-01"))
  target_year <- max(year(daily_totals$date), year(last_existing_date), current_year)

  # Add missing months from last_existing_date +1 to target_year Dec
  end_date_needed <- as.Date(paste0(target_year, "-12-01"))
  start_date_needed <- last_existing_date %m+% months(1)

  if(start_date_needed <= end_date_needed){
    months_needed <- seq.Date(start_date_needed, end_date_needed, by = "month")
    if(length(months_needed) > 0){
      extra_months <- data.frame(
        month = format(months_needed, "%Y-%m"),
        SMVal = 0, Val = 0, SMGra = 0, total = 0
      )
      monthly_totals_full <- bind_rows(monthly_totals_full, extra_months)
    }
  }

} else {
  # Initialize from Jan to Dec of current year
  monthly_totals_full <- data.frame(
    month = format(seq.Date(as.Date(paste0(current_year, "-01-01")),
                            as.Date(paste0(current_year, "-12-01")), by = "month"), "%Y-%m"),
    SMVal = 0, Val = 0, SMGra = 0, total = 0
  )
}

# --- 6. Update only selected months ---
monthly_totals_full <- monthly_totals_full %>%
  left_join(monthly_totals_update, by = "month", suffix = c("", ".upd")) %>%
  mutate(
    SMVal = ifelse(!is.na(SMVal.upd), SMVal.upd, SMVal),
    Val   = ifelse(!is.na(Val.upd), Val.upd, Val),
    SMGra = ifelse(!is.na(SMGra.upd), SMGra.upd, SMGra),
    total = SMVal + Val + SMGra
  ) %>%
  select(month, SMVal, Val, SMGra, total) %>%
  arrange(month)

# --- 7. Export JSON ---
write_json(monthly_totals_full, "public/output/monthly_totals_full.json", pretty = TRUE)

cat("✅ Monthly totals updated for:", paste(months_to_update, collapse = ", "), "\n")
cat("📄 Output file:", json_file, "\n")