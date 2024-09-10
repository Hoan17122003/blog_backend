#!/bin/bash

# Thời gian hiện tại
NOW=$(date +"%Y%m%d%H%M%S")

# Tên file backup
BACKUP_FILE="/backup/mysql-backup-$NOW.sql"

# Chạy lệnh mysqldump
mysqldump -h db -u root -pexample --all-databases > $BACKUP_FILE

# # Xóa các file backup cũ hơn 7 ngày
# find /backup/* -mtime +7 -exec rm {} \;
