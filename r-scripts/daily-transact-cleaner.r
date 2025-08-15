library(dplyr)
library(readr)
library(stringr)

# Read raw dummy data
raw_data <- read_csv("data/dummy_raw_transactions.csv")

cleaned_data <- raw_data %>%
  mutate(across(where(is.character), ~ str_trim(.))) %>%
  
  # Convert date_in to MM/DD/YY
  mutate(date_in_fmt = format(as.Date(date_in, format = "%Y-%m-%d"), "%m/%d/%y")) %>%
  
  # Format time_in as HH:MM then strip leading zero
  mutate(time_in_fmt = format(strptime(time_in, format = "%H:%M:%S"), "%H:%M"),
         time_in_fmt = sub("^0", "", time_in_fmt)) %>%
  
  # Merge date and time
  mutate(date_time = paste(date_in_fmt, time_in_fmt)) %>%
  
  # Extract branch_id
  mutate(branch_id = str_extract(transaction_id, "(?<=-)[A-Z]+(?=-)")) %>%
  
  # Keep only needed fields
  select(date_time,
         transaction_id,
         revenue = amount_paid,
         branch_id)

# Save cleaned data
output_path <- "data/daily_transactions_cleaned.csv"
write_csv(cleaned_data, output_path)

cat("Cleaned data saved to:", output_path, "\n")
