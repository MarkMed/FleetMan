import { UserRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import type { GetTotalUsersResponse } from '@packages/contracts';

/**
 * Use Case: Get Total Registered Users
 * 
 * Responsabilidades:
 * 1. Obtener stats completas del repositorio (con breakdown interno)
 * 2. Extraer SOLO el totalUsers para exposición pública
 * 3. No exponer breakdown ni información sensible
 * 4. Manejar errores de infraestructura
 * 
 * Purpose:
 * - Feature estratégica solicitada por cliente
 * - Mostrar transparencia del ecosistema (cantidad de usuarios registrados)
 * - Estimular networking y negocios internos (efecto snowball)
 * - Hookear más usuarios mostrando el tamaño de la comunidad
 * 
 * Authentication:
 * - Requiere usuario autenticado (validado en middleware)
 * - NO requiere roles específicos (cualquier usuario loggeado puede ver)
 * - NO requiere validación de userId (dato público agregado)
 * 
 * Privacy:
 * - Solo expone conteo total (número agregado)
 * - NO expone breakdown por tipo (interno del repo)
 * - NO expone datos de usuarios individuales
 * 
 * Sprint #12 - User Stats Feature
 */
export class GetTotalUsersUseCase {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Ejecuta el caso de uso de obtener total de usuarios
   * 
   * SSOT: Retorna GetTotalUsersResponse (definido en contracts)
   * El controller envuelve esto en ApiResponse<GetTotalUsersResponse>
   * 
   * @returns Promise<GetTotalUsersResponse> - Solo el totalUsers (sin breakdown)
   * @throws Error si hay error de infraestructura (DB down, query error)
   * 
   * Design decision: Use case NO recibe userId porque no filtra por usuario
   * Es un dato público agregado que cualquier usuario autenticado puede ver
   */
  async execute(): Promise<GetTotalUsersResponse> {
    logger.info('Getting total registered users');

    try {
      // 1. Obtener stats del repositorio (con breakdown interno)
      const repositoryResult = await this.userRepository.getTotalRegisteredUsers();

      // 2. Manejar errores de infraestructura
      if (!repositoryResult.success) {
        logger.error({ 
          error: repositoryResult.error.message 
        }, 'Repository error getting total users');
        throw new Error(`Database error: ${repositoryResult.error.message}`);
      }

      const stats = repositoryResult.data;

      // 3. Extraer SOLO totalUsers (no exponer breakdown)
      // El breakdown es información interna que el repo calcula para decisiones futuras
      // pero no se expone públicamente (por privacidad/estrategia)
      const response: GetTotalUsersResponse = {
        totalUsers: stats.totalUsers
      };

      logger.info({ 
        totalUsers: response.totalUsers 
      }, 'Total users retrieved successfully');

      // 4. Retornar solo dato público
      return response;
    } catch (error) {
      // Re-lanzar error para que el controller lo maneje (status code 500)
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 'Error in GetTotalUsersUseCase');
      throw error;
    }
  }
}

// =============================================================================
// FUTURE USE CASES (Strategic, commented for extensibility)
// =============================================================================

// /**
//  * Use Case: Get User Growth Statistics
//  * 
//  * Responsabilidades:
//  * - Calcular crecimiento de usuarios en período de tiempo
//  * - Comparar con período anterior para growth rate
//  * - Retornar breakdown por tipo si es necesario
//  * 
//  * Authentication: Admin only (información estratégica)
//  */
// export class GetUserGrowthStatsUseCase {
//   async execute(period: '7d' | '30d' | '90d' | '1y'): Promise<UserGrowthStats> {
//     // Implementation
//   }
// }

// /**
//  * Use Case: Get Active Users Statistics
//  * 
//  * Responsabilidades:
//  * - Contar usuarios que hicieron login en últimos N días
//  * - Calcular activity rate (% de usuarios totales)
//  * - Útil para KPIs y health metrics
//  * 
//  * Authentication: Admin only
//  */
// export class GetActiveUsersStatsUseCase {
//   async execute(period: '7d' | '30d' | '90d'): Promise<ActiveUsersStats> {
//     // Requiere agregar campo lastLoginAt en User
//     // Repo: await UserModel.countDocuments({ lastLoginAt: { $gte: startDate } })
//   }
// }

// /**
//  * Use Case: Get Users By Region Statistics
//  * 
//  * Responsabilidades:
//  * - Agrupar usuarios por región geográfica
//  * - Calcular breakdown por tipo en cada región
//  * - Útil para expansión y estrategia de mercado
//  * 
//  * Authentication: Admin only
//  * Requirements: Agregar campo 'region' a User profile
//  */
// export class GetUsersByRegionStatsUseCase {
//   async execute(): Promise<UsersByRegionStats> {
//     // Requiere agregar campo region en profile
//     // Repo: UserModel.aggregate([{ $group: { _id: '$profile.region', count: { $sum: 1 } } }])
//   }
// }
