import { DataSource } from 'typeorm';

let dataSource = null;

export const databaseProviders = [
    {
        provide: 'DATA_SOURCE',
        useFactory: async () => {
            dataSource = new DataSource({
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                username: 'root',
                password: 'Tu05102000@',
                database: 'websiteblog',
                entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                synchronize: true, // đồng bộ hóa entity với các table trong csdl
                // options: {
                //   // Tùy chọn này để tin tưởng vào chứng chỉ tự ký
                //   trustServerCertificate: true,
                //   // encrypt: true, // Sử dụng SSL/TLS
                // },
            });

            return dataSource.initialize();
        },
    },
];

export { dataSource };
