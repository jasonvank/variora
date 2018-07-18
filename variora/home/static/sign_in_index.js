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
const Msal = require('msal')


class NormalLoginForm extends React.Component {
  constructor(props) {
    super(props)

    const applicationConfig = {
      clientID: 'c9e686e3-bae8-4a0d-bcf1-26de09761807',
      graphScopes: ['user.read']
    }
    function authCallback(errorDesc, token, error, tokenType) {if (token) { console.log(token) } else { console.log(error + ':' + errorDesc) }}

    const userAgentApplication = new Msal.UserAgentApplication(applicationConfig.clientID, null, authCallback, { redirectUri: window.location.href })

    this.displayMicrosoftLogin = function() {
      userAgentApplication.loginPopup(applicationConfig.graphScopes).then(function(idToken) {
        //Login Success
        // console.log(idToken)
        userAgentApplication.acquireTokenSilent(applicationConfig.graphScopes).then(function(accessToken) {
          //AcquireToken Success
          var data = new FormData()
          data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
          data.append('accesstoken', accessToken)
          axios.post('/api/signin/microsoft', data).then((response) => {
            window.location.href = '/'
          }).catch(e => {
            notification['warning']({
              message: e.response == undefined ? '' : e.response.data,
              duration: 1.8,
            })
          })
        }, function(error) {
          //AcquireToken Failure, send an interactive request.
          userAgentApplication.acquireTokenPopup(applicationConfig.graphScopes).then(function(accessToken) {
            // updateUI()
          }, function(error) {
            console.log(error)
          })
        })
      }, function (error) {
        console.log(error)
      })
    }


    this.state = {
      fbLoginButtonLoading: true
    }

    this.handleSubmit = (e) => {
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
            notification['warning']({
              message: e.response == undefined ? '' : e.response.data,
              duration: 1.8,
            })
          })
        }
      })
    }

    this.facebookLogin = () => {
      FB.login(function(response) {
        var data = new FormData()
        data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
        data.append('auth_response', JSON.stringify(response.authResponse))
        axios.post('/api/signin/facebook', data).then(() => {
          window.location.href = '/'
        }).catch(e => {
          notification['warning']({
            message: e.response == undefined ? '' : e.response.data,
            duration: 1.8,
          })
        })
      }, {scope: 'email'})
    }

    this.redirectToNUSSignIn = () => {
      var host = 'https://' + window.location.host  // TODO: do not hardcode protocol
      window.location.href =
        'https://ivle.nus.edu.sg/api/login/?apikey=Z6Q2MnpaPX8sDSOfHTAnN&url=' + host + '/api/signin/nus'
    }
  }

  componentDidMount() {
    const self = this
    function loadFBSdk(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0]
      if (d.getElementById(id)) return
      js = d.createElement(s); js.id = id
      js.src = 'https://connect.facebook.net/en_US/sdk.js'
      fjs.parentNode.insertBefore(js, fjs)
    }
    loadFBSdk(document, 'script', 'facebook-jssdk')
    window.fbAsyncInit = function() {
      FB.init({
        appId      : '213151942857648',
        cookie     : true,
        xfbml      : true,
        version    : 'v3.0'
      })
      FB.AppEvents.logPageView()
      self.setState({fbLoginButtonLoading: false})
    }

    var auth2 = undefined
    function attachSignin(element) {
      auth2.attachClickHandler(element, {},
        function(googleUser) {
          var data = new FormData()
          data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
          data.append('id_token', googleUser.getAuthResponse().id_token)
          axios.post('/api/signin/google', data).then((response) => {
            window.location.href = '/'
          }).catch(e => {
            notification['warning']({
              message: e.response == undefined ? '' : e.response.data,
              duration: 1.8,
            })
          })
        }, function(error) {
          console.log(JSON.stringify(error, undefined, 2))
        }
      )
    }
    gapi.load('auth2', function(){
      auth2 = gapi.auth2.init({
        client_id: '887521980338-fj0n0r7ui5cn313f4vh6paqm411upf3o.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin',
      })
      attachSignin(document.getElementById('google-login'))
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    return (
      <Row style={{ marginTop: '8%' }}>
        <Col span={8} offset={8}>
          <Form onSubmit={this.handleSubmit} className='login-form' style={{ margin: 'auto' }}>
            <FormItem
            >
              {getFieldDecorator('email_address', {
                rules: [
                  // { required: true, message: 'Please input your email!' },
                  // { type: 'email', message: 'Please input an valid email address'}
                ],
                validateTrigger: 'onSubmit'
              })(
                <Input prefix={<Icon type='mail' style={{ fontSize: 13 }} />} placeholder='Email' />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('password', {
                // rules: [{ required: true, message: 'Please input your Password!' }],
              })(
                <Input prefix={<Icon type='lock' style={{ fontSize: 13 }} />} type='password' placeholder='Password' />
              )}
            </FormItem>
            <FormItem>
              <a className='login-form-forgot' href=''>Forgot password</a>
              <Button type='primary' htmlType='submit' className='login-form-button'>
                Log in
              </Button>
              Or <a href=''>register now!</a> (coming soon)
              <div id='third-party-login' style={{ marginTop: 28 }}>
                <Button
                  style={{backgroundColor: 'orange', borderColor: 'orange', marginTop: 16, color: 'white'}}
                  className='login-form-button'
                  htmlType='button'
                  type='primary'
                  onClick={this.redirectToNUSSignIn}
                >
                  Log in with NUS ID
                </Button>
                <Button
                  style={{ backgroundColor:'#DD4B39', borderColor:'#DD4B39', marginTop: 16, color: 'white' }}
                  className='login-form-button'
                  htmlType='button'
                  id='google-login'
                >
                  <i className='fa fa-google' aria-hidden='true'></i>
                  {'  '}Log in with Google
                </Button>
                <Button
                  style={{ backgroundColor:'#3b5998', borderColor:'#3b5998', marginTop: 16, color: 'white' }}
                  className='login-form-button'
                  htmlType='button'
                  id='facebook-login'
                  onClick={this.facebookLogin}
                  loading={this.state.fbLoginButtonLoading}
                >
                  <i className='fa fa-facebook-official' aria-hidden='true'></i>
                  {'  '}Log in with Facebook
                </Button>
                <Button
                  style={{ backgroundColor:'#0078D7', borderColor:'#0078D7', marginTop: 16, color: 'white' }}
                  className='login-form-button'
                  htmlType='button'
                  id='microsoft-login'
                  onClick={this.displayMicrosoftLogin}
                >
                  <i className='fa fa-windows' aria-hidden='true'></i>
                  {'  '}Log in with Outlook
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
