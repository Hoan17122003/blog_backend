import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Admin } from '../database/Entity/admin.entity';

@Injectable()
export class AdminService {
    constructor(@Inject('ADMINREPOSITORY') private readonly adminRepository: Repository<Admin>) {}
}
