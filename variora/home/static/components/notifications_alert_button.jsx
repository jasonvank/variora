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
    var dateFormat = require('dateformat')
    var description = this.state.newNotification.description
    var time = dateFormat(this.state.newNotification.timestamp, "mmmm d, yyyy")
console.log(time)
    var verb = ''
    var actionVerb = this.state.newNotification.verb
    if (actionVerb == 'reply to annotation reply') verb = 'replied'
    else if (actionVerb == 'reply to annotation') verb = 'replied'
    var title = this.state.newNotification.actor + ' ' + verb

    return (
      <div>
        <div style={{fontWeight: 'bold'}}><a target="_blank" href={this.state.newNotification.data.redirect_url} style={{ textDecoration: 'none' }}>{title}</a></div>
        <div className="notification-alert-list-wrapper" title={description}>{description}</div>
        <div style={{color: '#91959d'}}>{time}</div>
        {/* <TimeAgo style={{color: '#91959d'}} date={time} /> */}
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
      axios.get(record.mark_read_url)
      this.state.data[index].unread = false
      this.forceUpdate()
      this.checkLeftUnreadNotifications()
    }

    this.checkLeftUnreadNotifications = () => {
      var result = this.state.data.some(item => item.unread == true)
      result ? null : this.props.removeBadgeCallback()
    }
  }

  render(){
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
  }

  componentDidMount() {
    const self = this
    axios.get(getUrlFormat('/notifications/api/unread'))
      .then(response => {
        self.setState({
          data: response.data,
          show: response.data.length > 0 ? true : false
        })
      })
  }

  render() {
    return (
      <Badge dot={this.state.show} style={{ backgroundColor: '#52c41a', marginTop: -5 }}>
        <Popover
          content={<NotificationsList data={this.state.data} removeBadgeCallback={this.removeBadgeCallback}/>}
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
