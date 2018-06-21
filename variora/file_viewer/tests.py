from django.test import TestCase
from home.models import User
from models import Document


TEST_USER_NAME = "admin"
TEST_USER_EMAIL = "admin@admin.admin"
TEST_USER_PASS = "admin"
EXTERNAL_PDF_URL = "http://www.pdf995.com/samples/pdf.pdf"


class TestDocument(TestCase):
    def setUp(self):
        """
        create dummy user
        """
        self.dummy_user = User(
            nickname=TEST_USER_NAME,
            email_address=TEST_USER_EMAIL,
            password=TEST_USER_PASS
        )
        self.dummy_user.save()

    def test_file_on_server_method(self):
        document = Document(owner=self.dummy_user, external_url=EXTERNAL_PDF_URL)
        self.assertEqual(document.url, "/proxy?origurl=" + EXTERNAL_PDF_URL)
        self.assertEqual(document.file_on_server, False)

        # test if no input given, char field will be set to empty string
        document2 = Document(owner=self.dummy_user)
        self.assertEqual(document2.external_url, "")

    def test_not_null_not_constrain(self):
        document = Document()
        with self.assertRaises(Exception):
            document.save()
