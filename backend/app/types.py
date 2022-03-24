from typing import Optional, Dict, List
from datetime import date, datetime

from pydantic import validator, BaseModel
from sqlalchemy.orm import Query
from sqlalchemy.sql.operators import Operators


class OrmBase(BaseModel):
    # Common properties across orm models
    id: Optional[int]
    uid: str
    created_at: Optional[datetime]

    @validator("*", pre=True)
    def evaluate_lazy_columns(cls, v):
        if isinstance(v, Query):
            return v.all()
        return v

    class Config:
        orm_mode = True
        arbitrary_types_allowed = True


# Base Models
class UserBase(OrmBase):
    name: Optional[str]
    email: str
    phone: Optional[str]
    role: Optional[str]
    paying: Optional[bool] = False


class CompanyBase(OrmBase):
    name: str
    image_url: Optional[str]


class PermissionBase(OrmBase):
    type: str
    object_name: str


class ProjectBase(OrmBase):
    name: str
    description: Optional[str]
    status: Optional[str]
    type: Optional[str]
    data: Optional[Dict]
    country: Optional[str]
    city: Optional[str]
    floors_above_level: Optional[int]
    floors_behind_level: Optional[int]
    site_size: Optional[float]


class IntegrationBase(OrmBase):
    name: Optional[str]
    type: str
    payload: Optional[Dict] = {}
    secrets: Optional[str] = "{}"


class ProjectPhaseBase(OrmBase):
    name: str
    data: Optional[Dict]


class UserCompanyAssociationBase(OrmBase):
    is_admin: bool


class UserProjectAssociationBase(OrmBase):
    user_id: int
    is_admin: bool
    subscribe: Optional[bool] = False
    notify: Optional[bool] = False


class ProjectGroupBase(OrmBase):
    name: str


class ProjectGroupRolesBase(OrmBase):
    name: str


class ProjectFileBase(OrmBase):
    external_storage_id: str
    data: Optional[Dict] = {}


class ProjectFolderBase(OrmBase):
    data: Optional[Dict] = {}
    path: str


class ProjectFileIssueBase(OrmBase):
    name: Optional[str]
    description: Optional[str]
    image_url: Optional[str]
    data: Optional[Dict] = {}
    file_id: int
    user_id: int


class ProjectFileIssueCommentBase(OrmBase):
    text: Optional[str]
    data: Optional[Dict] = {}


# Models.
# User
class User(UserBase):
    data: Optional[Dict]


# Company
class UserCompanyAssociationCompany(UserCompanyAssociationBase):
    user: UserBase


class Company(CompanyBase):
    users: Optional[List[UserCompanyAssociationCompany]] = []


# Project
class ProjectGroupRolesProject(ProjectGroupRolesBase):
    company: Optional[CompanyBase]
    users: Optional[List[UserBase]] = []


class ProjectGroupProject(ProjectGroupBase):
    roles: Optional[List[ProjectGroupRolesProject]]


class UserProjectAssociationCompany(UserProjectAssociationBase):
    user: UserBase


class Project(ProjectBase):
    users: Optional[List[UserProjectAssociationCompany]] = []


# Project File.
class ProjectFile(ProjectFileBase):
    project: Project


# Project File Issue - get_issue
class ProjectForIssue(ProjectBase):
    users: Optional[List[UserProjectAssociationBase]] = []


class ProjectFileForIssue(ProjectFileBase):
    project: ProjectForIssue


class ProjectFileIssue(ProjectFileIssueBase):
    user: UserBase
    file: ProjectFileForIssue


# Project File Issue - fetch_issues
class ProjectFileIssueInList(ProjectFileIssueBase):
    user: UserBase


# Project File Issue Comment - fetch_comments
class ProjectFileIssueComment(ProjectFileIssueCommentBase):
    user: UserBase


# Permission = get_permissions
class Permission(PermissionBase):
    user: UserBase
