import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../jobs/entities/job.entity';
import { JobAirline } from '../job-airlines/entities/job-airline.entity';
import { GetLogbookDto, LogbookEntry, LogbookResponse } from './dto/logbook.dto';
import { PilotLicenseExpense } from '../licenses/entities/pilot-license-expense.entity';
import { PilotLicenseExpenseUser } from '../licenses/entities/pilot-license-expense-user.entity';
import { PilotLicenseItem } from '../licenses/entities/pilot-license-item.entity';
import { LicenseItemUser } from '../licenses/entities/license-item-user.entity';
import { User } from '../users/entities/user.entity';
import { Statistics } from '../statistics/entities/statistics.entity';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    @InjectRepository(JobAirline)
    private jobAirlineRepository: Repository<JobAirline>,
    @InjectRepository(PilotLicenseExpense)
    private pilotLicenseExpenseRepository: Repository<PilotLicenseExpense>,
    @InjectRepository(PilotLicenseExpenseUser)
    private pilotLicenseExpenseUserRepository: Repository<PilotLicenseExpenseUser>,
    @InjectRepository(PilotLicenseItem)
    private pilotLicenseItemRepository: Repository<PilotLicenseItem>,
    @InjectRepository(LicenseItemUser)
    private licenseItemUserRepository: Repository<LicenseItemUser>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Statistics)
    private statisticsRepository: Repository<Statistics>,
  ) {}

  /**
   * Busca o logbook de voos do usuário com paginação e filtros
   * Equivalente ao SearchProfileInfo do ProfileController.cs legado
   */
  async getLogbook(
    userId: string,
    dto: GetLogbookDto,
  ): Promise<LogbookResponse> {
    const {
      pageNumber = 1,
      pageSize = 10,
      sortOrder = 'Date_desc',
      departureFilter,
      arrivalFilter,
      modelDescriptionFilter,
    } = dto;

    const skip = (pageNumber - 1) * pageSize;

    // Criar query builder
    const queryBuilder = this.jobsRepository
      .createQueryBuilder('job')
      .where('job.user.id = :userId', { userId })
      .andWhere('job.isDone = :isDone', { isDone: true });

    // Aplicar filtros
    if (departureFilter) {
      queryBuilder.andWhere('job.departureICAO LIKE :departure', {
        departure: `%${departureFilter}%`,
      });
    }
    if (arrivalFilter) {
      queryBuilder.andWhere('job.arrivalICAO LIKE :arrival', {
        arrival: `%${arrivalFilter}%`,
      });
    }
    if (modelDescriptionFilter) {
      queryBuilder.andWhere('job.modelDescription LIKE :model', {
        model: `%${modelDescriptionFilter}%`,
      });
    }

    // Aplicar ordenação
    const [sortField, sortDirection] = sortOrder.split('_');
    const direction = sortDirection === 'asc' ? 'ASC' : 'DESC';

    switch (sortField) {
      case 'Date':
        queryBuilder.orderBy('job.endTime', direction);
        break;
      case 'DepartureICAO':
        queryBuilder.orderBy('job.departureICAO', direction);
        break;
      case 'ArrivalICAO':
        queryBuilder.orderBy('job.arrivalICAO', direction);
        break;
      case 'Model':
        queryBuilder
          .orderBy('job.modelDescription', direction)
          .addOrderBy('job.modelName', direction);
        break;
      case 'Distance':
        queryBuilder.orderBy('job.distance', direction);
        break;
      case 'Pax':
        queryBuilder.orderBy('job.pax', direction);
        break;
      case 'Cargo':
        queryBuilder.orderBy('job.cargo', direction);
        break;
      case 'Pay':
        queryBuilder.orderBy('job.pay', direction);
        break;
      default:
        queryBuilder.orderBy('job.endTime', 'DESC');
    }

    // Buscar total de registros
    const totalCount = await queryBuilder.getCount();

    // Aplicar paginação e buscar registros
    const jobs = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .getMany();

    // Converter para formato de LogbookEntry
    const entries: LogbookEntry[] = jobs.map((job) => ({
      id: job.id,
      departureICAO: job.departureICAO || '',
      arrivalICAO: job.arrivalICAO || '',
      startTime: job.startTime || new Date(),
      endTime: job.endTime || new Date(),
      modelDescription: job.modelDescription || '',
      modelName: job.modelName || '',
      distance: job.distance,
      pax: job.pax,
      cargo: job.cargo,
      pay: job.pay,
      flightTime: this.calculateFlightTime(job.startTime, job.endTime),
      usedFuelWeightDisplay: job.startFuelWeight - job.finishFuelWeight,
      payloadDisplay: this.calculatePayload(job),
      videoUrl: job.videoUrl,
      videoDescription: job.videoDescription,
    }));

    return {
      entries,
      totalCount,
      pageSize,
      currentPage: pageNumber,
    };
  }

  /**
   * Remove um job do logbook do usuário
   * Equivalente ao Delete do ProfileController.cs legado
   */
  async deleteLogbookJob(userId: string, jobId: number): Promise<void> {
    const job = await this.jobsRepository.findOne({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    // Verificar se o job pertence ao usuário
    const userJob = await this.jobsRepository.findOne({
      where: { id: jobId, user: { id: userId } },
    });

    if (!userJob) {
      throw new Error('You can only delete your own jobs');
    }

    // Deletar registros de JobAirline relacionados antes de deletar o Job
    await this.jobAirlineRepository.delete({ job: { id: jobId } });

    // Deletar o Job
    await this.jobsRepository.delete({ id: jobId });
  }

  /**
   * Calcula o tempo de voo formatado
   */
  private calculateFlightTime(startTime: Date, endTime: Date): string {
    if (!startTime || !endTime) return '0h 0m';

    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHours}h ${diffMinutes}m`;
  }

  /**
   * Calcula o payload do job
   */
  private calculatePayload(job: Job): number {
    const paxWeight = job.paxWeight > 0 ? job.paxWeight : 84;
    return job.pax * paxWeight + job.cargo;
  }

  /**
   * Busca as licenças do usuário
   * Equivalente ao PilotLicenseProfile do ProfileController.cs legado
   */
  async getLicenses(userId: string): Promise<any[]> {
    // Buscar ou criar licenças do usuário
    await this.insertUserPilotLicense(userId);

    // Buscar licenças do usuário com os itens
    const userLicenses = await this.pilotLicenseExpenseUserRepository.find({
      where: { user: { id: userId } },
      relations: ['pilotLicenseExpense'],
    });

    // Para cada licença, buscar os itens do usuário
    const licenses = await Promise.all(
      userLicenses.map(async (userLicense) => {
        const items = await this.licenseItemUserRepository.find({
          where: { user: { id: userId } },
          relations: ['pilotLicenseItem'],
        });

        // Filtrar apenas itens desta licença
        const licenseItems = items.filter(
          (item) => item.pilotLicenseItem?.pilotLicenseExpense?.id === userLicense.pilotLicenseExpense.id
        );

        return {
          id: userLicense.id,
          name: userLicense.pilotLicenseExpense.name,
          maturityDate: userLicense.maturityDate,
          isOverdue: new Date(userLicense.maturityDate) < new Date(),
          items: licenseItems.map((item) => ({
            id: item.id,
            name: item.pilotLicenseItem.name,
            price: item.pilotLicenseItem.price,
            image: item.pilotLicenseItem.image,
            isBought: item.isBought,
          })),
        };
      })
    );

    return licenses;
  }

  /**
   * Busca os itens de uma licença específica
   */
  async getLicenseItems(userId: string, licenseExpenseId: number): Promise<any[]> {
    const items = await this.licenseItemUserRepository.find({
      where: { user: { id: userId } },
      relations: ['pilotLicenseItem', 'pilotLicenseItem.pilotLicenseExpense'],
    });

    const licenseItems = items.filter(
      (item) => item.pilotLicenseItem?.pilotLicenseExpense?.id === licenseExpenseId
    );

    return licenseItems.map((item) => ({
      id: item.id,
      name: item.pilotLicenseItem.name,
      price: item.pilotLicenseItem.price,
      image: item.pilotLicenseItem.image,
      isBought: item.isBought,
    }));
  }

  /**
   * Compra um item de licença
   */
  async buyLicenseItem(userId: string, licenseItemId: number): Promise<any> {
    const item = await this.licenseItemUserRepository.findOne({
      where: { id: licenseItemId },
      relations: ['user', 'pilotLicenseItem', 'pilotLicenseItem.pilotLicenseExpense'],
    });

    if (!item) {
      throw new Error('License item not found');
    }

    if (item.user?.id !== userId) {
      throw new Error('You can only buy your own license items');
    }

    if (item.isBought) {
      throw new Error('Item already bought');
    }

    item.isBought = true;
    await this.licenseItemUserRepository.save(item);

    // Verificar se todos os itens da licença foram comprados
    const allItems = await this.licenseItemUserRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['pilotLicenseItem', 'pilotLicenseItem.pilotLicenseExpense'],
    });

    const licenseItems = allItems.filter(
      (i) => i.pilotLicenseItem?.pilotLicenseExpense?.id === item.pilotLicenseItem.pilotLicenseExpense.id
    );

    const allBought = licenseItems.every((i) => i.isBought);

    if (allBought) {
      // Atualizar a data de vencimento da licença
      const userLicense = await this.pilotLicenseExpenseUserRepository.findOne({
        where: {
          user: { id: userId },
          pilotLicenseExpense: { id: item.pilotLicenseItem.pilotLicenseExpense.id },
        },
      });

      if (userLicense) {
        const expense = await this.pilotLicenseExpenseRepository.findOne({
          where: { id: item.pilotLicenseItem.pilotLicenseExpense.id },
        });

        if (expense) {
          userLicense.maturityDate = new Date(Date.now() + expense.daysMaturity * 24 * 60 * 60 * 1000);
          userLicense.overdueProcessed = false;
          await this.pilotLicenseExpenseUserRepository.save(userLicense);
        }
      }
    }

    return { success: true, itemId: licenseItemId };
  }

  /**
   * Insere licenças do usuário se não existirem
   * Equivalente ao InsertUserPilotLicense do ProfileController.cs legado
   */
  private async insertUserPilotLicense(userId: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) return;

    // Verificar se já existem itens de licença para o usuário
    const existingItems = await this.licenseItemUserRepository.count({
      where: { user: { id: userId } },
    });

    if (existingItems === 0) {
      // Criar itens de licença para o usuário
      const allLicenseItems = await this.pilotLicenseItemRepository.find();
      for (const item of allLicenseItems) {
        const userItem = this.licenseItemUserRepository.create({
          user,
          pilotLicenseItem: item,
          isBought: false,
        });
        await this.licenseItemUserRepository.save(userItem);
      }
    }

    // Verificar se já existem despesas de licença para o usuário
    const existingExpenses = await this.pilotLicenseExpenseUserRepository.count({
      where: { user: { id: userId } },
    });

    if (existingExpenses === 0) {
      // Criar despesas de licença para o usuário
      const allExpenses = await this.pilotLicenseExpenseRepository.find();
      for (const expense of allExpenses) {
        const userExpense = this.pilotLicenseExpenseUserRepository.create({
          user,
          pilotLicenseExpense: expense,
          maturityDate: new Date(Date.now() + expense.daysMaturity * 24 * 60 * 60 * 1000),
          overdueProcessed: false,
          overdueProcessedOld: false,
        });
        await this.pilotLicenseExpenseUserRepository.save(userExpense);
      }
    }
  }

  /**
   * Busca a lista de graduações disponíveis
   * Equivalente ao PilotGraduation do ProfileController.cs legado
   */
  async getGraduations(): Promise<any[]> {
    return [
      { name: 'ATP Senior Commander', flightHours: '5000+' },
      { name: 'ATP Commander', flightHours: '4000 - 4999' },
      { name: 'ATP Senior Captain', flightHours: '3000 - 3999' },
      { name: 'ATP Captain', flightHours: '2000 - 2999' },
      { name: 'ATP First Officer', flightHours: '1500 - 1999' },
      { name: 'Commercial Senior Commander', flightHours: '1000 - 1499' },
      { name: 'Commercial Commander', flightHours: '750 - 999' },
      { name: 'Commercial Senior Captain', flightHours: '540 - 749' },
      { name: 'Commercial Captain', flightHours: '430 - 539' },
      { name: 'Commercial First Officer', flightHours: '360 - 429' },
      { name: 'Senior Captain', flightHours: '250 - 359' },
      { name: 'Captain', flightHours: '160 - 249' },
      { name: 'First Officer', flightHours: '80 - 159' },
      { name: 'Flight Officer', flightHours: '40 - 79' },
      { name: 'Junior Flight Officer', flightHours: '0 - 39' },
    ];
  }

  /**
   * Atualiza o avatar do usuário
   * @param userId ID do usuário
   * @param avatarId ID do avatar escolhido
   */
  async updateAvatar(userId: string, avatarId: number): Promise<void> {
    const statistics = await this.statisticsRepository.findOne({
      where: { user: { id: userId } },
    });

    if (statistics) {
      statistics.logo = avatarId.toString();
      await this.statisticsRepository.save(statistics);
    } else {
      // Criar statistics se não existir
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      if (user) {
        const newStatistics = this.statisticsRepository.create({
          user,
          logo: avatarId.toString(),
          bankBalance: 0,
          pilotScore: 0,
        });
        await this.statisticsRepository.save(newStatistics);
      }
    }
  }
}
