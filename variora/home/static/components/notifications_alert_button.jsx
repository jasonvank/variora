import 'regenerator-runtime/runtime'

import {Avatar, Badge, Icon, Popover, Table} from 'antd'
import {getCookie, getUrlFormat} from 'util.js'

import React from 'react'
import axios from 'axios'
import TimeAgo from 'react-timeago'


class NotificationsAvaratWrapper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newNotification: this.props.newNotification
    }
  }

  render() {
    var defaultAvatarUrl = '/media/default_notification_img.png'
    var defaultAvatar = <Avatar src={defaultAvatarUrl} style={{ verticalAlign: 'middle', background: 'white' }}></Avatar>
    var userAvatar = <Avatar src={this.state.newNotification.data.image_url} style={{ verticalAlign: 'middle', background: 'white' }}></Avatar>
    return (
      this.state.newNotification.data.image_url ? userAvatar : defaultAvatar
    )
  }
}


class NotificationsDetailsWrapper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newNotification: this.props.newNotification
    }
  }

  render() {
    const description = this.state.newNotification.description ? this.state.newNotification.description.trim() : ''
    var verb = ''
    const actionVerb = this.state.newNotification.verb

    if (actionVerb == 'reply to annotation reply' || actionVerb == 'reply to annotation')
      verb = description == '' ? 'replied' : 'replied:'
    else if (actionVerb == 'post annotation')
      verb = description == '' ? 'posted in your document' : 'posted in your document:'

    var title = this.state.newNotification.actor + ' ' + verb

    return (
      <div>
        <div style={{fontWeight: 'bold'}}><a target="_blank" href={this.state.newNotification.data.redirect_url} style={{ textDecoration: 'none' }}>{title}</a></div>
        <div className="notification-alert-list-wrapper" title={description}>{description}</div>
        <TimeAgo style={{color: '#91959d'}} date={this.state.newNotification.timestamp} />
      </div>
    )
  }
}


class NotificationsList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: this.props.data,
    }

    this.handleReadStatus = (record, index, event) => {
      if (this.state.data[index].unread) {
        axios.get(record.mark_read_url)
        this.state.data[index].unread = false
        this.forceUpdate()
        this.checkLeftUnreadNotifications()
      }
    }

    this.checkLeftUnreadNotifications = () => {
      const result = this.state.data.some(item => item.unread == true)
      result ? null : this.props.removeBadgeCallback()
      const unreadNotification = this.state.data.filter(item => item.unread == true)
      this.props.unreadNotificationsLeftCallback(unreadNotification.length)
    }
  }

  render() {
    const columns = [{
      title: 'Avatar',
      key: 'avatar',
      width: '20%',
      render: (text, record, index) => (
        <NotificationsAvaratWrapper newNotification={record}/>
      )
    }, {
      title: 'title',
      key: 'title',
      width: '75%',
      render: (text, record, index) => (
        <NotificationsDetailsWrapper newNotification={record}/>
      )
    }, {
      title: 'Read',
      key: 'read',
      width: '5%',
      render: (text, record, index) => (
        <Badge style={{verticalAlign: 'middle'}} status={record.unread ? 'processing' : 'default'}/>
      )
    }]

    return (
      <Table
        className='notification-table'
        dataSource={this.state.data}
        columns={columns}
        pagination={false}
        showHeader={false}
        style={{width: '300px', maxHeight: 380, overflowY: 'auto'}}
        rowKey={record => record.slug}
        onRowClick={this.handleReadStatus}
        footer={() => null}
      />
    )
  }
}


class NotificationsAlertButton extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      length: undefined,
      show: false,
      data: undefined
    }
    this.handleVisibleChange = (visible) => {
      this.setState({visible})
    }
    this.removeBadgeCallback = () => {
      this.setState({show: false})
    }
    this.unreadNotificationsLeftCallback = (unreadNotificationsLeft) => {
      this.setState({length: unreadNotificationsLeft})
    }
  }

  componentDidMount() {
    const self = this
    axios.get(getUrlFormat('/notifications/api/combined'))
      .then(response => {
        self.setState({
          data: response.data,
          show: response.data.length > 0 ? true : false,
          length: response.data.filter(item => item.unread == true).length,
        })
      })
  }

  render() {
    return (
      <Badge count={this.state.length} style={{ backgroundColor: '#52c41a', marginTop: -5 }}>
        <Popover
          content={<NotificationsList data={this.state.data} removeBadgeCallback={this.removeBadgeCallback} unreadNotificationsLeftCallback={this.unreadNotificationsLeftCallback} />}
          trigger='click'
          visible={this.state.visible}
          onVisibleChange={this.handleVisibleChange}
        >
          <Icon type="bell" style={{ cursor: 'pointer', fontSize: 18, marginLeft: 28, verticalAlign: 'middle', marginTop: -2 }}/>
        </Popover>
      </Badge>
    )
  }
}

export { NotificationsAlertButton }
