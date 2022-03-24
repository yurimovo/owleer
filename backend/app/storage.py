import datetime
from sys import prefix
import urllib
from typing import List, Optional

from pydantic import BaseModel
import boto3

from app.config import get_settings

settings = get_settings()


class BucketObjectOwner(BaseModel):
    ID: str


class BucketObject(BaseModel):
    Key: str
    LastModified: datetime.datetime
    ETag: str
    Size: int
    owner: BucketObjectOwner


storage = boto3.client("s3")
storage_resource = boto3.resource("s3")


def get_bucket(bucket_name: str):
    return storage_resource.Bucket(name=bucket_name)


def generate_image_file_uri(file_path: str):
    uri = "%s%s" % (
        "https://owleer-public.s3.us-east-2.amazonaws.com/",
        urllib.parse.quote(file_path, safe="~()*!.'"),
    )

    return uri


def generate_file_uri(file_path: str):
    """
    Generate public file URI.

    Arguments:
        bucket_name: (string) The name of the target bucket.
        file_path: (string) The target file key.
    Returns:
        Public URI of the file.(string)
    """
    uri = "%s%s" % (
        settings.file_service_url,
        urllib.parse.quote(file_path, safe="~()*!.'"),
    )

    return uri


def create_bucket(bucket_name: str):
    """
    Create a bucket on amazon s3.

    Arguments:
        bucket_name: (string) The name of the new bucket.
    """
    cors_configuration = {
        "CORSRules": [
            {
                "AllowedHeaders": ["Authorization"],
                "AllowedMethods": ["GET"],
                "AllowedOrigins": ["*"],
                "ExposeHeaders": ["GET"],
                "MaxAgeSeconds": 3000,
            }
        ]
    }
    storage.create_bucket(
        Bucket=bucket_name,
        CreateBucketConfiguration={
            "LocationConstraint": "us-east-2",
        },
    )

    storage.put_bucket_cors(Bucket=bucket_name, CORSConfiguration=cors_configuration)


def delete_bucket(bucket_name: str):
    """
    Delete bucket from s3.

    Arguments:
        bucket_name: (string) The name of the new bucket.
    """
    bucket = get_bucket(bucket_name=bucket_name)
    bucket.delete()


def list_bucket_objects(bucket_name: str, prefix="", delimiter="/"):
    """
    List objects in bucket.

    Arguments:
        bucket_name: (string) The name of the new bucket.
        prefix: (string) Objects key prefix.
        delimiter: (string) First delimiter.
    """
    bucket_objects = storage.list_objects_v2(
        Bucket=bucket_name, Prefix=prefix, Delimiter=delimiter
    )
    return bucket_objects


def get_bucket_object(bucket_name: str, key: str, version_id: Optional[str] = None):
    """
    Fetch object from the bucket.

    Arguments:
        bucket_name: (string) The name of the new bucket.
        key: (string) Object key.
        version_id: (string) Object version ID.
    """
    if version_id:
        object = storage.get_object(Bucket=bucket_name, Key=key, VersionId=version_id)
    else:
        object = storage.get_object(Bucket=bucket_name, Key=key)

    return object


def upload_public_file(
    file_obj: bytes, bucket_name: str, file_name: str, path: str = "/"
):
    """
    Upload file object to bucket (public).

    Arguments:
        file_obj: (bytes) File object bytes.
        bucket_name: (string) Target bucket name.
        file_name: (string) The name of the uploaded file.
    """
    key = path + file_name if path != "/" else file_name

    storage.upload_fileobj(
        Fileobj=file_obj,
        Bucket=bucket_name,
        Key=key,
        ExtraArgs={"ACL": "public-read"},
    )

    object = storage.get_object(Bucket=bucket_name, Key=key)

    return object


def upload_file(file_obj: bytes, bucket_name: str, file_name: str, path: str = "/"):
    """
    Upload file object to bucket.

    Arguments:
        file_obj: (bytes) File object bytes.
        bucket_name: (string) Target bucket name.
        file_name: (string) The name of the uploaded file.
    """
    key = path + file_name if path != "/" else file_name

    storage.upload_fileobj(Fileobj=file_obj, Bucket=bucket_name, Key=key)

    object = storage.get_object(Bucket=bucket_name, Key=key)

    return object


def create_folder(bucket_name: str, folder_name: str, path: str = "/"):
    """
    Upload file object to bucket.

    Arguments:
        file_obj: (bytes) File object bytes.
        bucket_name: (string) Target bucket name.
        file_name: (string) The name of the uploaded file.
    """
    key = f"{path}{folder_name}/" if path != "/" else f"{folder_name}/"

    storage.put_object(
        Bucket=bucket_name,
        Key=key,
    )


def delete_object(bucket_name: str, key: str):
    """
    Delete object from bucket.

    Arguments:
        bucket_name: (string) Target bucket name.
        key: (string) The key of the object.
    """
    storage.delete_object(Bucket=bucket_name, Key=key)


def change_object_prefix(
    obj: storage_resource.Object, bucket_name: str, old_prefix: str, new_prefix: str
):
    """
    Change S3 cloud object prefix.

    Arguments:
        obj: (s3.Object) The target object.
        old_prefix: (string) The prefix which has to be replaced.
        new_prefix: (string) The new prefix

    """
    bucket_obj = get_bucket(bucket_name=bucket_name)
    old_source = {"Bucket": bucket_name, "Key": obj.key}
    # replace the prefix
    new_key = obj.key.replace(old_prefix, new_prefix, 1)
    new_obj = bucket_obj.Object(new_key)
    new_obj.copy(old_source)
    object_acl = storage_resource.ObjectAcl(bucket_name, new_key)
    object_acl.put(ACL="public-read")
    obj.delete()
    return new_obj


def rename_object(bucket_name: str, old_path: str, new_path: str):
    """
    Rename object from bucket.

    Arguments:
        old_path: (string) Old object path.
        new_path: (string) New object path.
    """
    if old_path == new_path:
        return

    new_obj = storage_resource.Object(bucket_name, new_path)

    new_obj.copy_from(CopySource=bucket_name + "/" + old_path)
    object_acl = storage_resource.ObjectAcl(bucket_name, new_path)
    object_acl.put(ACL="public-read")

    storage_resource.Object(bucket_name, old_path).delete()


def list_object_versions(bucket_name: str, key: str):
    """
    List object versions.

    Arguments:
        bucket_name: (string) Target bucket name.
        key: (string) The key of the object.
    """
    response = storage.list_object_versions(Bucket=bucket_name, Prefix=key)
    return response["Versions"]
