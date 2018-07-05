import uuid


def uuid2slug(uuid_val):
    try:
        return uuid_val.bytes.encode('base64').rstrip('=\n').replace('/', '_').replace('+', '-')
    except:
        return None


def slug2uuid(slug):
    try:
        return uuid.UUID(bytes=(slug + '==').replace('_', '/').replace('-', '+').decode('base64'))
    except:
        return None
