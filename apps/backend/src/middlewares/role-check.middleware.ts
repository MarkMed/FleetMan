import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

/**
 * Middleware to check if user has required role
 * @param allowedRoles Array of roles that can access the endpoint
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    if (!allowedRoles.includes(authReq.user.type)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: authReq.user.type
      });
    }

    next();
  };
};

// TODO: Future MVP+ features - implement when ownership-based access is needed
// 
// /**
//  * Middleware to check if user owns the resource
//  * @param getResourceUserId Function to extract userId from the resource
//  */
// export const requireOwnership = (getResourceUserId: (req: Request) => string) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     const authReq = req as AuthenticatedRequest;
//     
//     if (!authReq.user) {
//       return res.status(401).json({ error: 'Authentication required' });
//     }
// 
//     try {
//       const resourceUserId = await getResourceUserId(req);
//       
//       if (authReq.user.id !== resourceUserId) {
//         return res.status(403).json({ 
//           error: 'Access denied - resource ownership required' 
//         });
//       }
// 
//       next();
//     } catch (error) {
//       return res.status(500).json({ 
//         error: 'Failed to verify resource ownership' 
//       });
//     }
//   };
// };
// 
// /**
//  * Middleware to check if user has required role OR owns the resource
//  * @param allowedRoles Array of roles that can access the endpoint
//  * @param getResourceUserId Function to extract userId from the resource
//  */
// export const requireRoleOrOwnership = (
//   allowedRoles: string[], 
//   getResourceUserId: (req: Request) => string
// ) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     const authReq = req as AuthenticatedRequest;
//     
//     if (!authReq.user) {
//       return res.status(401).json({ error: 'Authentication required' });
//     }
// 
//     // Check role first
//     if (allowedRoles.includes(authReq.user.type)) {
//       return next();
//     }
// 
//     // If role doesn't match, check ownership
//     try {
//       const resourceUserId = await getResourceUserId(req);
//       
//       if (authReq.user.id === resourceUserId) {
//         return next();
//       }
// 
//       return res.status(403).json({ 
//         error: 'Access denied - insufficient permissions or ownership required' 
//       });
//     } catch (error) {
//       return res.status(500).json({ 
//         error: 'Failed to verify permissions' 
//       });
//     }
//   };
// };