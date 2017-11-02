import os

from django.conf import settings
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.support.ui import WebDriverWait
from user_dashboard.models import User

MAX_TOLERATED_LOADING_TIME_IN_SEC = 10
TEST_USER_NAME = "admin"
TEST_USER_EMAIL = "admin@admin.admin"
TEST_USER_PASS = "admin"
TEST_PDF_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test.pdf")
MEDIA_PDF_PATH = os.path.join(settings.MEDIA_ROOT, "pdf", "test.pdf")


def log_in(browser):
    User.objects.create_user(TEST_USER_NAME, TEST_USER_EMAIL, TEST_USER_PASS)

    login_btn = browser.find_element_by_link_text("Log In Now")
    login_btn.click()
    browser.find_element_by_name("email_address").send_keys(TEST_USER_EMAIL)
    browser.find_element_by_name("password").send_keys(TEST_USER_NAME)
    browser.find_element_by_id("submit_login_form_btn").click()


class DashboardUITest(StaticLiveServerTestCase):
    @classmethod
    def setUpClass(cls):
        cls.browser = webdriver.Chrome()
        super(DashboardUITest, cls).setUpClass()

    @classmethod
    def tearDownClass(cls):
        super(DashboardUITest, cls).tearDownClass()
        cls.browser.quit()

    def setUp(self):
        self.browser.get(self.live_server_url)
        log_in(self.browser)

    def tearDown(self):
        '''
        remove document for test stored in the media folder due to the upload
        '''
        if os.path.isfile(MEDIA_PDF_PATH):
            os.remove(MEDIA_PDF_PATH)

    def test_search_bar(self):
        browser = self.browser

        # test search bar in dashboard
        search_field = browser.find_element_by_name("search_key")
        WebDriverWait(browser, MAX_TOLERATED_LOADING_TIME_IN_SEC).until(expected_conditions.visibility_of(search_field))
        search_field.send_keys("netwprk")
        search_field.send_keys(Keys.ENTER)
        self.assertEqual(str(browser.current_url).split('/')[-1], "handle_search?search_key=netwprk")

    def test_add_group(self):
        browser = self.browser

        # test if add group button works
        add_group_btn = browser.find_element_by_class_name("pe-7s-plus")
        add_group_btn.click()
        create_group_popup_window = browser.find_element_by_class_name("layui-layer")
        self.assertIsNotNone(create_group_popup_window)
        group_name = browser.find_element_by_name("coterie_name")
        group_descrip = browser.find_element_by_name("coterie_description")
        crete_btn = browser.find_element_by_xpath("//form[@id='create_group_form']/button")
        WebDriverWait(browser, MAX_TOLERATED_LOADING_TIME_IN_SEC).until(expected_conditions.visibility_of(crete_btn))
        
        group_name.send_keys("CS")
        group_descrip.send_keys("This is a study group")
        crete_btn.send_keys(Keys.RETURN)
        WebDriverWait(browser, MAX_TOLERATED_LOADING_TIME_IN_SEC).until(expected_conditions.presence_of_element_located((By.CLASS_NAME, "group_page_button")))
        
        group = str(browser.find_element_by_class_name("group_page_button").text.split('\n')[0])
        self.assertEqual(group, "CS")

    def test_upload_pdf(self):
        browser = self.browser
        file_input = browser.find_element_by_id("file_upload_input")
        file_name_input = browser.find_element_by_name("title")
        file_input.send_keys(TEST_PDF_PATH)
        file_name_input.send_keys("This is a test pdf")
        browser.find_element_by_xpath("//button[contains(text(),'Upload')]").send_keys(Keys.RETURN)
        WebDriverWait(browser, MAX_TOLERATED_LOADING_TIME_IN_SEC).until(expected_conditions.presence_of_element_located((By.CLASS_NAME, "EditDocTitleButton")))
        self.assertEqual(len(browser.find_elements_by_class_name("EditDocTitleButton")), 1)

        # test open document button
        browser.find_element_by_xpath("//button[contains(text(),'Open')]").send_keys(Keys.RETURN)
        self.assertTrue("file_viewer" in str(browser.current_url))
