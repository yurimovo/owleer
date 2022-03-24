import datetime
import base64
import json
import uuid
from enum import Enum
from boto3 import resource
from pydantic import BoolError

from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql.expression import false
from sqlalchemy.sql.sqltypes import Boolean

from sqlalchemy_utils import EncryptedType

from app.config import get_settings


settings = get_settings()

Base = declarative_base()

# Enums.
class ProjectUserGroups(Enum):
    MANAGEMENT = "management"
    ENGINEERING = "engineering"
    FIELD = "field"


class PermissionTypes(Enum):
    VIEW = "view"
    EDIT = "edit"


# Helpers.
def generate_uid():
    """
    Generate object UID.
    """
    return str(uuid.uuid4())


def encode_s3_external_storage_id(bucket_name: str, file_key: str, etag: str):
    """
    Generate ProjectFile external storage ID.

    Arguments:
        bucket_name: (string) The bucket where the file is stored.
        file_key: (string) The file Key (Path at the bucket).
        etag: (string) File aws etag (File md5 hash).
    """
    return base64.b64encode(
        json.dumps(
            {"bucket_name": bucket_name, "file_key": file_key, "etag": etag}
        ).encode("utf-8")
    ).decode("utf-8")


def decode_s3_external_storage_id(id: str):
    """
    Decode s3 external storage ID to JSON data.

    Arguments:
        id: (string) The target ID string.
    Returns:
        Bucket name, s3 file key and file etag. (Dict)
    """
    return json.loads(base64.b64decode(id))


# Models.
class UserCompanyAssociation(Base):
    __tablename__ = "user_company_associations"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), primary_key=True)

    uid = Column(String, unique=True, index=True, default=generate_uid)
    is_admin = Column(Boolean, default=False)
    create_date = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="companies")
    company = relationship("Company", back_populates="users")


class UserProjectAssociation(Base):
    __tablename__ = "user_project_associations"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), primary_key=True)

    uid = Column(String, unique=True, index=True, default=generate_uid)
    is_admin = Column(Boolean, default=False)
    notify = Column(Boolean, default=False)
    subscribe = Column(Boolean, default=False)
    create_date = Column(DateTime, default=datetime.datetime.utcnow)
    additional_user_data = Column(JSON)

    user = relationship("User", back_populates="projects")
    project = relationship("Project", back_populates="users")


class CompanyProjectAssociation(Base):
    __tablename__ = "company_project_associations"

    company_id = Column(Integer, ForeignKey("companies.id"), primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), primary_key=True)

    uid = Column(String, unique=True, index=True, default=generate_uid)
    is_admin = Column(Boolean, default=False)
    create_date = Column(DateTime, default=datetime.datetime.utcnow)

    company = relationship("Company", overlaps="companies")
    project = relationship("Project", overlaps="projects")


class UserGroupRoleAssociation(Base):
    __tablename__ = "user_group_role_associations"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    role_id = Column(Integer, ForeignKey("project_group_roles.id"), primary_key=True)

    uid = Column(String, unique=True, index=True, default=generate_uid)
    create_date = Column(DateTime, default=datetime.datetime.utcnow)


class FileOrderAssociation(Base):
    __tablename__ = "file_order_associations"

    file_id = Column(Integer, ForeignKey("project_files.id"), primary_key=True)
    order_id = Column(Integer, ForeignKey("project_orders.id"), primary_key=True)

    data = Column(JSON)

    uid = Column(String, unique=True, index=True, default=generate_uid)
    create_date = Column(DateTime, default=datetime.datetime.utcnow)

    file = relationship("ProjectFile", back_populates="orders")
    order = relationship("ProjectOrder", back_populates="files")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    role = Column(String)
    phone = Column(String)
    auth_token = Column(String, unique=True, index=True)
    image_url = Column(String, nullable=True)
    data = Column(JSON)
    paying = Column(Boolean, default=False)
    uid = Column(String, unique=True, index=True, default=generate_uid)
    create_date = Column(DateTime, default=datetime.datetime.utcnow)

    companies = relationship(UserCompanyAssociation, back_populates="user")
    projects = relationship(UserProjectAssociation, back_populates="user")
    files = relationship("ProjectFile", back_populates="user")
    folders = relationship("ProjectFolder", back_populates="user")
    integrations = relationship("Integration", back_populates="user")


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True)
    name = Column(String, index=True)
    image_url = Column(String, nullable=True)
    uid = Column(String, unique=True, index=True, default=generate_uid)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    projects = relationship(CompanyProjectAssociation, back_populates="company")
    users = relationship(UserCompanyAssociation, back_populates="company")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(String)
    status = Column(String)
    type = Column(String)
    data = Column(JSON)
    country = Column(String)
    city = Column(String)
    floors_above_level = Column(Integer)
    floors_behind_level = Column(Integer)
    site_size = Column(Float)
    uid = Column(String, unique=True, index=True, default=generate_uid)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    phases = relationship(
        "ProjectPhase", back_populates="project", cascade="all, delete"
    )

    files = relationship("ProjectFile", back_populates="project")
    folders = relationship("ProjectFolder", back_populates="project")

    companies = relationship(CompanyProjectAssociation, back_populates="project")
    users = relationship(UserProjectAssociation, back_populates="project")
    groups = relationship("ProjectGroup", back_populates="project")
    orders = relationship("ProjectOrder", back_populates="project")


class ProjectGroup(Base):
    __tablename__ = "project_gourps"
    id = Column(Integer, primary_key=True)
    uid = Column(String, unique=True, index=True, default=generate_uid)
    name = Column(String)
    project = relationship(Project, back_populates="groups")
    project_id = Column(Integer, ForeignKey("projects.id"))

    roles = relationship("ProjectGroupRoles", back_populates="group")

    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ProjectGroupRoles(Base):
    __tablename__ = "project_group_roles"
    id = Column(Integer, primary_key=True)
    uid = Column(String, unique=True, index=True, default=generate_uid)

    name = Column(String)

    group_id = Column(Integer, ForeignKey("project_gourps.id"))
    group = relationship(ProjectGroup, back_populates="roles")

    company_id = Column(Integer, ForeignKey("companies.id"))
    company = relationship(Company)

    users = relationship(User, secondary="user_group_role_associations")

    deadline = Column(DateTime)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ProjectPhase(Base):
    __tablename__ = "project_phases"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    data = Column(JSON)
    project = relationship(Project, back_populates="phases")
    project_id = Column(Integer, ForeignKey("projects.id"))
    uid = Column(String, unique=True, index=True, default=generate_uid)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ProjectEvent(Base):
    __tablename__ = "project_events"
    id = Column(Integer, primary_key=True)

    name = Column(String)
    type = Column(String)
    data = Column(JSON)

    project = relationship(Project)
    project_id = Column(Integer, ForeignKey("projects.id"))

    initiator = relationship(User)
    initiator_id = Column(Integer, ForeignKey("users.id"))

    uid = Column(String, unique=True, index=True, default=generate_uid)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ProjectFile(Base):
    __tablename__ = "project_files"

    id = Column(Integer, primary_key=True)
    external_storage_id = Column(String, index=True)
    description = Column(String)
    data = Column(JSON)
    project = relationship(Project, back_populates="files")
    project_id = Column(Integer, ForeignKey("projects.id"))
    user = relationship(User, back_populates="files")
    user_id = Column(Integer, ForeignKey("users.id"))
    issues = relationship("ProjectFileIssue", back_populates="file")
    pages = relationship("ProjectFilePage", back_populates="file")
    versions = relationship("ProjectFileVersion", back_populates="file")
    orders = relationship(FileOrderAssociation, back_populates="file")
    uid = Column(String, unique=True, index=True, default=generate_uid)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ProjectFileVersion(Base):
    __tablename__ = "project_file_versions"
    id = Column(Integer, primary_key=True)

    external_version_id = Column(String, index=True)
    description = Column(String)
    data = Column(JSON)

    file_id = Column(Integer, ForeignKey("project_files.id"))
    file = relationship(ProjectFile, back_populates="versions")

    user = relationship(User)
    user_id = Column(Integer, ForeignKey("users.id"))

    uid = Column(String, unique=True, index=True, default=generate_uid)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ProjectFolder(Base):
    __tablename__ = "project_folders"

    id = Column(Integer, primary_key=True)
    data = Column(JSON)
    path = Column(String)
    project = relationship(Project, back_populates="folders")
    project_id = Column(Integer, ForeignKey("projects.id"))
    user = relationship(User, back_populates="folders")
    user_id = Column(Integer, ForeignKey("users.id"))
    uid = Column(String, unique=True, index=True, default=generate_uid)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ProjectFilePage(Base):
    __tablename__ = "project_file_pages"

    id = Column(Integer, primary_key=True)

    data = Column(JSON)

    number = Column(Integer, index=True)

    file_id = Column(Integer, ForeignKey("project_files.id"))
    file = relationship(ProjectFile, back_populates="pages")

    uid = Column(String, unique=True, index=True, default=generate_uid)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ProjectFileIssue(Base):
    __tablename__ = "project_file_issues"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(String)
    image_url = Column(String)
    data = Column(JSON)

    comments = relationship("ProjectFileIssueComment", back_populates="issue")

    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User")

    file_id = Column(Integer, ForeignKey("project_files.id"))
    file = relationship(ProjectFile, back_populates="issues")

    page = Column(Integer, index=True)

    uid = Column(String, unique=True, index=True, default=generate_uid)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ProjectFileIssueComment(Base):
    __tablename__ = "project_file_issue_comments"

    id = Column(Integer, primary_key=True)
    data = Column(JSON)
    text = Column(String)

    parent_comment_id = Column(Integer, ForeignKey("project_file_issue_comments.id"))

    issue_id = Column(Integer, ForeignKey("project_file_issues.id"))
    issue = relationship(ProjectFileIssue, back_populates="comments")

    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User")

    uid = Column(String, unique=True, index=True, default=generate_uid)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ProjectOrder(Base):
    __tablename__ = "project_orders"
    id = Column(Integer, primary_key=True)

    type = Column(String)
    approved = Column(Boolean, default=False)
    data = Column(JSON)

    customer_id = Column(Integer, ForeignKey("users.id"))
    customer = relationship("User")

    project_id = Column(Integer, ForeignKey("projects.id"))
    project = relationship(Project, back_populates="orders")

    printing_agency_id = Column(Integer, ForeignKey("project_printing_agency.id"))
    printing_agency = relationship("ProjectPrintingAgency")

    files = relationship(FileOrderAssociation, back_populates="order")

    uid = Column(String, unique=True, index=True, default=generate_uid)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ProjectPrintingAgency(Base):
    __tablename__ = "project_printing_agency"

    id = Column(Integer, primary_key=True)

    name = Column(String)
    email = Column(String)
    works = Column(ARRAY(String))

    project_id = Column(Integer, ForeignKey("projects.id"))
    project = relationship(Project)

    uid = Column(String, unique=True, index=True, default=generate_uid)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True)

    data = Column(JSON)

    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User")

    type = Column(String)

    object_name = Column(String)
    object_uid = Column(String, index=True)

    uid = Column(String, unique=True, index=True, default=generate_uid)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Integration(Base):
    __tablename__ = "integrations"

    id = Column(Integer, primary_key=True)

    name = Column(String)
    payload = Column(JSON)
    type = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    secrets = Column(EncryptedType(String, settings.app_secret), nullable=True)

    user = relationship("User", back_populates="integrations")

    uid = Column(String, unique=True, index=True, default=generate_uid)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class MailMessage(Base):
    __tablename__ = "mails"

    id = Column(Integer, primary_key=True)

    subject = Column(String)

    data = Column(JSON)

    sender_id = Column(Integer, ForeignKey("users.id"))

    recipient_id = Column(Integer, ForeignKey("users.id"))

    external_message_id = Column(String)

    delivered = Column(Boolean, default=False)
    delivery_time = Column(DateTime, nullable=True)

    opened = Column(Boolean, default=False)
    opening_time = Column(DateTime, nullable=True)

    uid = Column(String, unique=True, index=True, default=generate_uid)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
