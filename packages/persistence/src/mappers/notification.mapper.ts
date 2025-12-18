import type { INotification } from '@packages/domain';
import type { Types } from 'mongoose';

/**
 * Interface for Mongoose notification subdocument
 * Matches INotificationSubdoc from user.model.ts
 */
interface INotificationSubdoc extends Omit<INotification, 'id'> {
  _id: Types.ObjectId;
}

/**
 * Notification Mapper
 * Converts between Mongoose subdocument and domain interface
 * Pattern: Similar to QuickCheck mapping in machine.mapper.ts
 */
export class NotificationMapper {
  /**
   * Maps Mongoose notification subdocument to domain INotification interface
   * @param doc - Mongoose subdocument with _id
   * @returns Domain interface with id (string)
   */
  static toDomain(doc: INotificationSubdoc): INotification {
    return {
      id: doc._id.toString(),
      notificationType: doc.notificationType,
      message: doc.message,
      wasSeen: doc.wasSeen,
      notificationDate: doc.notificationDate,
      actionUrl: doc.actionUrl,
      sourceType: doc.sourceType
    };
  }

  /**
   * Maps array of Mongoose notification subdocuments to domain INotification[] interfaces
   * @param docs - Array of Mongoose subdocuments
   * @returns Array of domain interfaces
   */
  static toDomainArray(docs: INotificationSubdoc[]): INotification[] {
    return docs.map(doc => NotificationMapper.toDomain(doc));
  }
}
