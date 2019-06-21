/* eslint-disable comma-dangle */
import '../../css/test_index.css'
import 'regenerator-runtime/runtime'

import { Avatar, Col, Icon, Input, Layout, Dropdown, Menu, Row } from 'antd'
import { FormattedMessage, IntlProvider, addLocaleData, injectIntl } from 'react-intl'
import { getCookie, getValFromUrlParam, groupAvatarColors } from 'util.js'
import React from 'react'

import { GroupSelectionButton } from '../group_selection_button.jsx'
import { InvitationsToggleButton } from '../invitations_toggle_button.jsx'
import { NotificationsAlertButton } from '../notifications_alert_button.jsx'

const { Header } = Layout
const Search = Input.Search

function getCoterieUUID() {
  if (window.location.pathname.includes('/groups/')) return window.location.pathname.split('/')[2]
  return undefined
}

class Navbar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: {},
      administratedCoteries: {},
      joinedCoteries: {},
      locale: 'en',
    }
  }

  ComponentDidMount() {
    this.setState({
      user: this.props.user,
      administratedCoteries: this.props.administratedCoteries,
      joinedCoteries: this.props.joinedCoteries,
      locale: this.props.locale,
    })
  }

  ComponentWillReceiveProps(nextProps) {
    this.setState({
      user: nextProps.user,
      administratedCoteries: nextProps.administratedCoteries,
      joinedCoteries: nextProps.joinedCoteries,
      locale: nextProps.locale,
    })
  }

  render() {
    let searchPlaceholder = 'Variora'

    let groupIcon = null
    const currentCoterieUUID = getCoterieUUID()
    if (currentCoterieUUID !== undefined) {
      let currentCoterie

      let filtered = this.props.administratedCoteries.filter(c => c.uuid === currentCoterieUUID)
      if (filtered.length > 0) currentCoterie = filtered[0]

      filtered = this.props.joinedCoteries.filter(c => c.uuid === currentCoterieUUID)
      if (filtered.length > 0) currentCoterie = filtered[0]

      if (currentCoterie !== undefined) {
        const color = groupAvatarColors[currentCoterieUUID.charCodeAt(0) % 8]
        groupIcon = (
          <Avatar
            style={{
              width: 18,
              height: 18,
              backgroundColor: color,
              top: 16,
              left: -6,
              verticalAlign: 'middle',
            }}
            size={'small'}
          >
            <span style={{ position: 'relative', top: -3 }}>
              {currentCoterie.name.slice(0, 2).toUpperCase()}
            </span>
          </Avatar>
        )
      }
    }

    if (window.location.pathname.includes('/groups/')) {
      const coterieUUID = window.location.pathname.split('/')[2]
      const filtered = this.props.administratedCoteries
        .concat(this.props.joinedCoteries)
        .filter(c => c.uuid === coterieUUID)
      if (filtered.length !== 0) searchPlaceholder = `${filtered[0].name}`
    }

    // language menu
    let locales = ['en', 'zh']
    let languageLabels = {
      zh: '简体中文',
      en: 'English',
    }
    const languageIcons = {
      zh: '🇨🇳',
      en: '🇬🇧',
    }
    const languageMenu = (
      <Menu
        selectedKeys={[this.props.locale]}
        onClick={this.props.handleLanguageChange}
        style={{ marginTop: 20 }}
      >
        {locales.map(locale => (
          <Menu.Item key={locale}>
            <span role='img'>{languageIcons[locale]}</span> {languageLabels[locale]}
          </Menu.Item>
        ))}
      </Menu>
    )

    return (
      <Header
        className='header'
        style={{
          backgroundColor: '#fff',
          diplay: 'inline',
          position: 'fixed',
          zIndex: 1,
          width: '100%',
        }}
      >
        <Row>
          <Col span={4}>
            {/* <div className="logo" /> */}
            <a href='/'>
              <img
                src='/media/logo.png'
                height={48}
                style={{ verticalAlign: 'middle', marginLeft: 28 }}
              />
            </a>
            {groupIcon}
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <FormattedMessage id='app.search.global_group' values={{ group: searchPlaceholder }}>
              {msg => (
                <Search
                  placeholder={msg}
                  style={{ width: '60%' }}
                  onSearch={this.props.handleSearch}
                  defaultValue={
                    window.location.pathname.includes('/search') ? getValFromUrlParam('key') : ''
                  }
                />
              )}
            </FormattedMessage>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <GroupSelectionButton
              administratedCoteries={this.props.administratedCoteries}
              joinedCoteries={this.props.joinedCoteries}
              setCreateCoterieModelVisible={this.props.setCreateCoterieModelVisible}
              currentCoterieUUID={getCoterieUUID()}
            />
            <NotificationsAlertButton />
            <InvitationsToggleButton
              user={this.props.user}
              acceptInvitationCallback={this.props.acceptInvitationCallback}
            />

            <Dropdown overlay={languageMenu} placement='bottomLeft'>
              <Icon
                type='global'
                style={{
                  fontSize: 16,
                  marginLeft: 28,
                  cursor: 'pointer',
                  verticalAlign: 'middle',
                }}
              />
            </Dropdown>

            <span style={{ marginRight: 12, marginLeft: 28, color: '#666' }}>
              {this.props.user.nickname}
            </span>
            {this.props.user.is_authenticated ? (
              <a onClick={this.props.signOff}>
                <FormattedMessage id='app.sign_off' defaultMessage='Sign Off' />
              </a>
            ) : (
              <a href='/sign-in'>
                <FormattedMessage id='app.sign_in' defaultMessage='Sign In' />
              </a>
            )}
            <Avatar
              style={{
                marginLeft: 28,
                marginRight: 18,
                marginTop: -2,
                verticalAlign: 'middle',
              }}
              size={'large'}
              src={this.props.user.portrait_url}
            />
          </Col>
        </Row>
      </Header>
    )
  }
}

export { Navbar }
