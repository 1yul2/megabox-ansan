from app.modules.auth.models import PositionEnum

ADMIN_ROLES = {PositionEnum.admin}

STAFF_ROLES = {
    PositionEnum.leader,
    PositionEnum.crew,
    PositionEnum.cleaner,
}

SYSTEM_ROLES = PositionEnum.system


# 관리자 여부
def is_admin(user) -> bool:
    return user.position in ADMIN_ROLES


def is_staff(user) -> bool:
    return user.position in STAFF_ROLES


def is_system(user) -> bool:
    return user.position == SYSTEM_ROLES
