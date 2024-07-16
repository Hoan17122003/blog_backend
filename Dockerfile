# Sử dụng image Node.js chính thức
FROM node:14

# Đặt thư mục làm việc trong container
WORKDIR /app

# Sao chép file package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn ứng dụng vào container
COPY . .

# Build ứng dụng
RUN npm run build

# Expose port mà ứng dụng sẽ chạy
EXPOSE 80

# Command để chạy ứng dụng
CMD ["npm", "run", "start:prod"]
