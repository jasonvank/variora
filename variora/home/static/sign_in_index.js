import './css/sign_in_index.css'
import 'regenerator-runtime/runtime'

import { Button, Col, Form, Icon, Input, Layout, LocaleProvider, Menu, Modal, Row, notification } from 'antd'
import { getCookie, getUrlFormat } from 'util.js'

import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US'

const FormItem = Form.Item

const { SubMenu } = Menu
const { Header, Content, Sider } = Layout
const MenuItemGroup = Menu.ItemGroup
const Search = Input.Search


class NormalLoginForm extends React.Component {
  onSuccess(user) {
    console.log(user)
  }
  onFailure() {}
  componentDidMount() {
    var auth2 = undefined
    function attachSignin(element) {
      auth2.attachClickHandler(element, {},
          function(googleUser) {
            console.log(googleUser)

            var data = new FormData()
            data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
            data.append('id_token', googleUser.getAuthResponse().id_token)
            axios.post('/api/signin/google', data).then((response) => {
              window.location.href = "/"
            }).catch(e => {
              console.log(e.response)
              notification['warning']({
                message: e.response == undefined ? '' : e.response.data,
                duration: 1.8,
              })
            })
          }, function(error) {
            alert(JSON.stringify(error, undefined, 2))
          })
    }
    gapi.load('auth2', function(){
      // Retrieve the singleton for the GoogleAuth library and set up the client.
      auth2 = gapi.auth2.init({
        client_id: '519848814448-89p2bv1b6bksdnd3in64r25j9vq1hgc5.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin',
      })
      attachSignin(document.getElementById('google-login'))
    })
  }
  redirectToNUSSignIn() {
    var host = 'http://' + window.location.host
    window.location.href =
      'https://ivle.nus.edu.sg/api/login/?apikey=Z6Q2MnpaPX8sDSOfHTAnN&url=' + host + '/handle_nus_log_in'
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        var data = new FormData()
        for (var key in values)
          data.append(key.toString(), values[key])
        data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
        axios.post('/api/signin', data).then((response) => {
          window.location.href = '/'
        }).catch(e => {
          console.log(e)
          console.log(e.response)
          notification['warning']({
            message: e.response == undefined ? '' : e.response.data,
            // description: e.response == undefined ? '' : e.response.data,
            duration: 1.8,
          })
        })
      }
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form
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
              Or <a href="">register now!</a> (coming soon)
              <div id='third-party-login' style={{ marginTop: 28 }}>
                <Button
                  style={{backgroundColor: 'orange', borderColor: 'orange', marginTop: 8, color: 'white'}}
                  className="login-form-button"
                  htmlType='button'
                  type='primary'
                  onClick={this.redirectToNUSSignIn}
                >
                  Log in with NUS ID
                </Button>
                <Button
                  style={{ backgroundColor:'#DD4B39', marginTop: 8, color: 'white' }}
                  className="login-form-button"
                  htmlType='button'
                  id='google-login'
                >
                  <i className="fa fa-google-plus" aria-hidden="true"></i>
                  {'  '}Log in with Google
                </Button>
              </div>
            </FormItem>
          </Form>
        </Col>
      </Row>
    )
  }
}

const SignInForm = Form.create()(NormalLoginForm)

ReactDOM.render(
  <LocaleProvider locale={enUS}>
    <SignInForm />
  </LocaleProvider>,
  document.getElementById('main')
)
