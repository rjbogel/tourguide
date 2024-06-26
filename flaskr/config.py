from datetime import timedelta


class Config:
    SECRET_KEY = '72109f9aed8e0f7b633091e2adbba912'
    CORS_HEADERS = 'Content-Type'
    SQLALCHEMY_DATABASE_URI = 'mysql://root:@localhost/db_tourguide'
    # COOKIE_NAME = "remember_token"
    # COOKIE_DURATION = timedelta(days=365)
    # COOKIE_SECURE = False
    # COOKIE_HTTPONLY = True
    # COOKIE_SAMESITE = None
    LOGIN_MESSAGE = "Anda harus masuk terlebih dahulu untuk dapat mengakses halaman ini"
    # LOGIN_MESSAGE_CATEGORY = "message"
    # REFRESH_MESSAGE = "Please reauthenticate to access this page."
    # REFRESH_MESSAGE_CATEGORY = "message"
    # ID_ATTRIBUTE = "get_id"
    # SESSION_KEYS = {
    #     "_user_id",
    #     "_remember",
    #     "_remember_seconds",
    #     "_id",
    #     "_fresh",
    #     "next",
    # }
    # EXEMPT_METHODS = {"OPTIONS"}
    # USE_SESSION_FOR_NEXT = False