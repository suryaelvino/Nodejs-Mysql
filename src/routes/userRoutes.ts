import UsersController from '../controllers/userControllers';

const api = 'api';
const users = 'users';

const userRoutes = [
    { url: `/${api}/${users}/getlist`,          method: "get",      handler: UsersController.getAllUsers },
    { url: `/${api}/${users}/getdetail/:id`,    method: "get",      handler: UsersController.getUserById },
    { url: `/${api}/${users}/add`,              method: "post",     handler: UsersController.createUser },
    { url: `/${api}/${users}/update/:id`,       method: "put",      handler: UsersController.updateUser },
    { url: `/${api}/${users}/delete/:id`,       method: "delete",   handler: UsersController.deleteUser }
];

export { userRoutes };