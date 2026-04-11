import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRoleEnum } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminService } from './admin.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN)
@Controller('admin')
export class AdminController {
    constructor(private readonly service: AdminService) {}

    @Get('overview')
    overview() {
        return this.service.getOverview();
    }

    @Get('users')
    users(
        @Query('page') page = '1',
        @Query('limit') limit = '10',
        @Query('search') search?: string,
    ) {
        const parsed = this.parsePagination(page, limit);
        return this.service.getUsers({ ...parsed, search });
    }

    @Get('subjects')
    subjects(
        @Query('page') page = '1',
        @Query('limit') limit = '10',
        @Query('search') search?: string,
    ) {
        const parsed = this.parsePagination(page, limit);
        return this.service.getSubjects({ ...parsed, search });
    }

    @Get('documents')
    documents(
        @Query('page') page = '1',
        @Query('limit') limit = '10',
        @Query('search') search?: string,
    ) {
        const parsed = this.parsePagination(page, limit);
        return this.service.getDocuments({ ...parsed, search });
    }

    private parsePagination(page: string, limit: string) {
        const parsedPage = Number.parseInt(page, 10);
        const parsedLimit = Number.parseInt(limit, 10);

        if (!Number.isInteger(parsedPage) || parsedPage < 1) {
            throw new BadRequestException('page must be a positive integer');
        }

        if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
            throw new BadRequestException('limit must be an integer between 1 and 100');
        }

        return { page: parsedPage, limit: parsedLimit };
    }
}
