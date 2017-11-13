import 'antd/dist/antd.css';
import './css/sign_in_index.css'
import 'regenerator-runtime/runtime';

import { Button, Col, Form, Icon, Input, Layout, LocaleProvider, Menu, Modal, Row, notification } from 'antd';
import { getCookie, getUrlFormat } from 'util.js'

import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US';

const FormItem = Form.Item;

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;
const MenuItemGroup = Menu.ItemGroup;
const Search = Input.Search;


class NormalLoginForm extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        var data = new FormData()
        for (var key in values)
          data.append(key.toString(), values[key])
        data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
        axios.post('/api/signin', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((response) => {
          window.location.href = "/test";  // redirect to userdashboard
        }).catch(e => {
          notification['warning']({
            message: e.message,
            description: e.response == undefined ? '' : e.response.data,
            duration: 6,
          });
        })
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Row style={{ marginTop: '8%' }}>
        <Col span={8} offset={8}>
          <Form onSubmit={this.handleSubmit} className="login-form" style={{ margin: 'auto' }}>
            <FormItem
            >
              {getFieldDecorator('email_address', {
                rules: [
                  // { required: true, message: 'Please input your email!' },
                  // { type: 'email', message: 'Please input an valid email address'}
                ],
                validateTrigger: 'onSubmit'
              })(
                <Input prefix={<Icon type="mail" style={{ fontSize: 13 }} />} placeholder="Email" />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('password', {
                // rules: [{ required: true, message: 'Please input your Password!' }],
              })(
                <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="Password" />
              )}
            </FormItem>
            <FormItem>
              <a className="login-form-forgot" href="">Forgot password</a>
              <Button type="primary" htmlType="submit" className="login-form-button">
                Log in
              </Button>
              Or <a href="">register now!</a>
            </FormItem>
          </Form>
        </Col>
      </Row>
    );
  }
}

const SignInForm = Form.create()(NormalLoginForm);

ReactDOM.render(
  <LocaleProvider locale={enUS}>
    <SignInForm />
  </LocaleProvider>, 
  document.getElementById('main')
);