from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from django.db import IntegrityError
from django.test import TestCase
from models import User
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


TEST_USER_NAME = "admin"
TEST_USER_EMAIL = "admin@admin.admin"
TEST_USER_PASS = "admin"


class TestUser(TestCase):
    def test_create_user(self):
        new_user = User()
        new_user.save()
        count = User.objects.all().count()
        self.assertEqual(count, 1)

    def test_user_default_property(self):
        new_user = User()
        new_user.save()
        self.assertEqual(new_user.portrait_url, "/media/portrait/default_portrait.png")
        self.assertEqual(new_user.is_active, True)
        self.assertEqual(new_user.nickname, "")

    def test_create_user_with_same_email_address(self):
        new_user = User()
        new_user.email_address = "test@test.test"
        new_user2 = User()
        new_user2.email_address = new_user.email_address

        new_user.save()
        self.assertEqual(User.objects.all().count(), 1)
        self.assertEqual(User.objects.filter(email_address="test@test.test").count(), 1)

        try:
            new_user2.save()
            self.assertTrue(False)
        except IntegrityError:
            self.assertTrue(True)

    def test_create_user_with_same_empty_email_address(self):
        new_user = User()
        new_user2 = User()

        new_user.save()
        self.assertEqual(User.objects.all().count(), 1)
        self.assertEqual(User.objects.filter(email_address="").count(), 1)

        try:
            new_user2.save()
            self.assertTrue(False)
        except IntegrityError:
            self.assertTrue(True)


# class HomeUITest(StaticLiveServerTestCase):
#     @classmethod
#     def setUpClass(cls):
#         cls.browser = webdriver.Chrome()
#         super(HomeUITest, cls).setUpClass()

#     @classmethod
#     def tearDownClass(cls):
#         super(HomeUITest, cls).tearDownClass()
#         cls.browser.quit()

#     def setUp(self):
#         User.objects.create_user(TEST_USER_NAME, TEST_USER_EMAIL, TEST_USER_PASS)

#     def test_login_logout(self):
#         browser = self.browser
#         browser.get(self.live_server_url)

#         # test log in
#         login_btn = browser.find_element_by_link_text("Log In Now")
#         login_btn.click()
#         login_popup_window = browser.find_element_by_class_name("layui-layer")
#         self.assertIsNotNone(login_popup_window)
#         browser.find_element_by_name("email_address").send_keys(TEST_USER_EMAIL)
#         browser.find_element_by_name("password").send_keys(TEST_USER_PASS)
#         browser.find_element_by_id("submit_login_form_btn").click()
#         self.assertIsNotNone(browser.find_element_by_id("logout_btn"))

#         # test log out
#         browser.find_element_by_id("logout_btn").click()
#         self.assertIsNotNone(browser.find_element_by_link_text("Log In Now"))

#     def test_login_with_incorrect_email(self):
#         browser = self.browser
#         browser.get(self.live_server_url)

#         # test input wrong log in email and password
#         login_btn = browser.find_element_by_link_text("Log In Now")
#         login_btn.click()
#         browser.find_element_by_name("email_address").send_keys(TEST_USER_EMAIL)
#         browser.find_element_by_name("password").send_keys("admi")
#         browser.find_element_by_id("submit_login_form_btn").click()
#         err_message = browser.find_element_by_tag_name("h1").text
#         self.assertEqual(err_message, "email address or password is wrong")

#     def test_sign_up_to_right_page(self):
#         browser = self.browser
#         browser.get(self.live_server_url)

#         #test if sign up button linked to right page
#         signup_btn = browser.find_element_by_link_text("Sign Up Now")
#         signup_btn.click()
#         self.assertEqual(str(browser.current_url).split('/')[-1], "sign_up")

#     def test_search_by_keyword(self):
#         browser = self.browser
#         browser.get(self.live_server_url)

#         #test search by keyword
#         search_field = browser.find_element_by_xpath("//input[@type='search']")
#         WebDriverWait(browser, 10).until(EC.visibility_of(search_field))
#         search_field.send_keys("algorithm")
#         search_field.send_keys(Keys.ENTER)
#         self.assertEqual(str(browser.current_url).split('/')[-1], "handle_search?search_key=algorithm")
