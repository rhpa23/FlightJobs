import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { CustomPlaneCapacity } from './entities/custom-plane-capacity.entity';
import { Statistics } from '../statistics/entities/statistics.entity';

@Injectable()
export class CustomCapacityService {
  constructor(
    @InjectRepository(CustomPlaneCapacity)
    private readonly customCapacityRepository: Repository<CustomPlaneCapacity>,
    @InjectRepository(Statistics)
    private readonly statisticsRepository: Repository<Statistics>,
  ) {}

  /**
   * Retorna todas as capacidades personalizadas do usuário
   * Equivalente ao GetUserCustomCapacity do BaseController
   */
  async getUserCapacities(userId: string): Promise<CustomPlaneCapacity[]> {
    try {
      return await this.customCapacityRepository.find({
        where: { userId },
        order: { planeName: 'ASC' as const },
      });
    } catch (error) {
      console.error('Erro ao buscar capacidades do usuário:', error);
      throw error;
    }
  }

  /**
   * Retorna uma capacidade por ID
   * Equivalente ao GetCustonCapacity do SearchJobsController
   */
  async getCapacityById(id: number): Promise<CustomPlaneCapacity> {
    const capacity = await this.customCapacityRepository.findOne({ where: { id } });
    if (!capacity) {
      throw new NotFoundException('Capacity not found');
    }
    // Adiciona o caminho da imagem baseado no nome
    capacity.imageUrl = this.getCustomCapacityPath(capacity.planeName);
    return capacity;
  }

  /**
   * Salva ou atualiza uma capacidade personalizada
   * Equivalente ao SaveCapacity do SearchJobsController
   */
  async saveCapacity(
    userId: string,
    planeName: string,
    paxCapacity: number,
    cargoCapacity: number,
    paxWeight: number,
    imageUrl?: string,
  ): Promise<CustomPlaneCapacity> {
    const statistics = await this.statisticsRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!statistics) {
      throw new NotFoundException('Statistics not found');
    }

    // Busca se já existe uma capacidade com o mesmo nome para o usuário
    const existingCapacity = await this.customCapacityRepository.findOne({
      where: { userId, planeName },
    });

    if (existingCapacity) {
      // Atualiza a capacidade existente
      existingCapacity.paxCapacity = paxCapacity;
      existingCapacity.cargoCapacity = cargoCapacity;
      existingCapacity.paxWeight = paxWeight;
      if (imageUrl) existingCapacity.imageUrl = imageUrl;
      await this.customCapacityRepository.save(existingCapacity);
      statistics.customPlaneCapacity = existingCapacity;
      await this.statisticsRepository.save(statistics);
      return existingCapacity;
    } else {
      // Cria nova capacidade
      const newCapacity = this.customCapacityRepository.create({
        user: statistics.user,
        userId,
        planeName: planeName.trim(),
        paxCapacity,
        cargoCapacity,
        paxWeight,
        imageUrl,
      });
      const savedCapacity = await this.customCapacityRepository.save(newCapacity);
      statistics.customPlaneCapacity = savedCapacity;
      await this.statisticsRepository.save(statistics);
      return savedCapacity;
    }
  }

  /**
   * Atualiza uma capacidade existente
   * Equivalente ao UpdateCapacity do SearchJobsController
   */
  async updateCapacity(
    id: number,
    userId: string,
    planeName: string,
    paxCapacity: number,
    cargoCapacity: number,
    paxWeight: number,
    imageUrl?: string,
  ): Promise<CustomPlaneCapacity> {
    const statistics = await this.statisticsRepository.findOne({
      where: { userId },
    });

    if (!statistics) {
      throw new NotFoundException('Statistics not found');
    }

    const capacity = await this.customCapacityRepository.findOne({
      where: { id },
    });

    if (!capacity) {
      throw new NotFoundException('Capacity not found');
    }

    // Verifica se já existe outra capacidade com o mesmo nome
    const hasSameName = await this.customCapacityRepository.findOne({
      where: { userId, planeName, id: Not(id) },
    });

    if (hasSameName) {
      throw new ConflictException('Capacity with same name already exists');
    }

    capacity.planeName = planeName;
    capacity.paxCapacity = paxCapacity;
    capacity.cargoCapacity = cargoCapacity;
    capacity.paxWeight = paxWeight;
    if (imageUrl) capacity.imageUrl = imageUrl;

    const updatedCapacity = await this.customCapacityRepository.save(capacity);
    statistics.customPlaneCapacity = updatedCapacity;
    await this.statisticsRepository.save(statistics);

    return updatedCapacity;
  }

  /**
   * Seleciona uma capacidade como ativa
   * Equivalente ao SelectCapacity do SearchJobsController
   */
  async selectCapacity(capacityId: number, userId: string): Promise<Statistics> {
    const statistics = await this.statisticsRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!statistics) {
      throw new NotFoundException('Statistics not found');
    }

    const capacity = await this.customCapacityRepository.findOne({
      where: { id: capacityId, userId },
    });

    if (!capacity) {
      throw new NotFoundException('Capacity not found');
    }

    statistics.customPlaneCapacity = capacity;
    statistics.customPlaneCapacityId = capacityId;
    return this.statisticsRepository.save(statistics);
  }

  /**
   * Remove uma capacidade
   * Equivalente ao RemoveCapacity do SearchJobsController
   */
  async removeCapacity(capacityId: number, userId: string): Promise<void> {
    const statistics = await this.statisticsRepository.findOne({
      where: { userId },
    });

    if (!statistics) {
      throw new NotFoundException('Statistics not found');
    }

    const capacity = await this.customCapacityRepository.findOne({
      where: { id: capacityId, userId },
    });

    if (!capacity) {
      throw new NotFoundException('Capacity not found');
    }

    // Primeiro limpa a referência no Statistics antes de remover a capacidade
    if (statistics.customPlaneCapacityId === capacityId) {
      statistics.customPlaneCapacity = null;
      statistics.customPlaneCapacityId = null;
      await this.statisticsRepository.save(statistics);
    }

    await this.customCapacityRepository.remove(capacity);
  }

  /**
   * Retorna o caminho da imagem baseado no nome da capacidade
   * Equivalente ao GetCustomCapacityPath do SearchJobsController
   */
  private getCustomCapacityPath(planeName: string): string {
    const lowerName = planeName.toLowerCase();
    const basePath = '/Content/img/planes/';

    if (lowerName.includes('320')) return `${basePath}A320.JPG`;
    if (lowerName.includes('crj')) return `${basePath}CRJ.JPG`;
    if (lowerName.includes('citation')) return `${basePath}Citation.JPG`;
    if (lowerName.includes('787')) return `${basePath}B787.JPG`;

    return `${basePath}default.jpg`;
  }
}
