import { Router } from 'express';
import { requireAuth } from '../../lib/auth.js';
import { productsRouter } from './products.js';
import { contentRouter } from './content.js';
import { requestsRouter } from './requests.js';
import { statsRouter } from './stats.js';
import { usersRouter } from './users.js';
import { mediaRouter } from './media.js';

export const adminRouter = Router();

// Вся админская часть за аутентификацией. Роли проверяются точечно внутри
// роутеров: чтение доступно viewer, запись — editor, пользователи — admin.
adminRouter.use(requireAuth);

adminRouter.use('/products', productsRouter);
adminRouter.use('/requests', requestsRouter);
adminRouter.use('/stats', statsRouter);
adminRouter.use('/users', usersRouter);
adminRouter.use('/media', mediaRouter);
adminRouter.use('/', contentRouter);
