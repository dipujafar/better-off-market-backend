import { Router } from "express";
import { USER_ROLE } from "../modules/user/user.constants";
import auth from "../middleware/auth";
import { dashboardController } from "./dashboard.controller";

const router = Router();

router.get(
    '/analytics',
    auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
    dashboardController.getAdminProfileAnalytics,
);

export const dashboardRoutes = router;