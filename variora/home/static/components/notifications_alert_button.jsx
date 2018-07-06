import 'regenerator-runtime/runtime'

import { Avatar, Badge, Button, Icon, notification, Popover, Table } from 'antd'
import { getCookie, getUrlFormatm } from 'util.js'

import React from 'react'
import axios from 'axios'

class NotificationsAvaratWrapper extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      newNotification : this.props.newNotification
    }
  }

  render() {
    var defaultAvatarUrl = '/media/defaultAvatar.png'
    var defaultAvatar = <Avatar src = { defaultAvatarUrl }  style={{ verticalAlign: 'middle', background: 'white' }}></Avatar>
    var userAvatar = <Avatar src = { this.state.newNotification.avatar } style={{ verticalAlign: 'middle', background: 'white' }}></Avatar>
    return (
      this.state.newNotification.avatar ? userAvatar : defaultAvatar
    )
  }
}

class NotificationsDetailsWrapper extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      newNotification: this.props.newNotification
    }
  }
  render() {
    return (
      <div>
        <div>{this.state.newNotification.title}</div>
        <div>{this.state.newNotification.description}</div>
        <div>{this.state.newNotification.datetime}</div>
      </div>
    )
  }
}

class NotificationsList extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      data: this.props.data,
      status: this.props.data.status
    }
    this.handleReadStatus = (record, index, event) => {
    }
  }

  render() {
    const columns = [{
      title: 'Avatar',
      // dataIndex: 'this.state.data.avatar',
      key: 'avatar',
      width: '20%',
      render: (text, record, index) => (
        <NotificationsAvaratWrapper newNotification = {record}/>
      ),
    }, {
      title: 'title',
      // dataIndex: 'this.state.data',
      key: 'title',
      width: '75%',
      render: (text, record, index) => (
        <NotificationsDetailsWrapper newNotification = {record}/>
      ),
    }, {
      title: 'Read',
      key: 'read',
      width: '5%',
      render: (text, record, index) => (
        <Badge style={{ verticalAlign: 'middle' }} status="processing" />
      ),
    }]
    return (
      <Table
        dataSource={this.state.data}
        columns={columns}
        pagination={false}
        showHeader={false}
        scroll={{ y: 600 }}
        style={{ cursor: 'pointer', width: '300px' }}
        rowKey={record => record.id}
        onRowClick={this.handleReadStatus}
      />
    )
  }
}




class NotificationsAlertButton extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      hide: true,
    }
    this.hide = () => {
      this.setState({
        visible: false,
      })
    }
    this.handleVisibleChange = (visible) => {
      this.setState({ visible })
    }
  }

  render() {
    const data = [{
      id: '000000001',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
      title: '你收到了 14 份新周报',
      status: 'read',
      datetime: '2017-08-09',
      type: '通知',
    }, {
      id: '000000002',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/OKJXDXrmkNshAMvwtvhu.png',
      title: '你推荐的 曲妮妮 已通过第三轮面试',
      datetime: '2017-08-08',
      status: 'read',
      type: '通知',
    }, {
      id: '000000003',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/kISTdvpyTAhtGxpovNWd.png',
      title: '这种模板可以区分多种通知类型',
      datetime: '2017-08-07',
      read: true,
      status: 'read',
      type: '通知',
    }, {
      id: '000000004',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/GvqBnKhFgObvnSGkDsje.png',
      title: '左侧图标用于区分不同的类型',
      datetime: '2017-08-07',
      type: '通知',
    }, {
      id: '000000005',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
      title: '内容不要超过两行字，超出时自动截断',
      status: 'read',
      datetime: '2017-08-07',
      type: '通知',
    }, {
      id: '000000006',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg',
      title: '曲丽丽 评论了你',
      description: '描述信息描述信息描述信息',
      status: 'read',
      datetime: '2017-08-07',
      type: '消息',
    }, {
      id: '000000007',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg',
      title: '朱偏右 回复了你',
      description: '这种模板用于提醒谁与你发生了互动，左侧放『谁』的头像',
      status: 'read',
      datetime: '2017-08-07',
      type: '消息',
    }, {
      id: '000000008',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg',
      title: '标题',
      status: 'read',
      description: '这种模板用于提醒谁与你发生了互动，左侧放『谁』的头像',
      datetime: '2017-08-07',
      type: '消息',
    }, {
      id: '000000012',
      title: 'ABCD 版本发布',
      description: '冠霖提交于 2017-01-06，需在 2017-01-07 前完成代码变更任务',
      extra: '进行中',
      status: 'unread',
      type: '待办',
    }, {
      id: '000000013',
      title: 'ABCD 版本发布',
      description: '冠霖提交于 2017-01-06，需在 2017-01-07 前完成代码变更任务',
      extra: '进行中',
      status: 'read',
      type: '待办',
    }, {
      id: '000000014',
      title: 'ABCD 版本发布',
      description: '冠霖提交于 2017-01-06，需在 2017-01-07 前完成代码变更任务',
      extra: '进行中',
      status: 'read',
      type: '待办',
    }, {
      id: '000000015',
      title: 'ABCD 版本发布',
      description: '冠霖提交于 2017-01-06，需在 2017-01-07 前完成代码变更任务',
      extra: '进行中',
      status: 'read',
      type: '待办',
    }, {
      id: '000000016',
      title: 'ABCD 版本发布',
      description: '冠霖提交于 2017-01-06，需在 2017-01-07 前完成代码变更任务',
      extra: '进行中',
      status: 'read',
      type: '待办',
    }, {
      id: '000000017',
      title: 'ABCD 版本发布',
      description: '冠霖提交于 2017-01-06，需在 2017-01-07 前完成代码变更任务',
      extra: '进行中',
      status: 'unread',
      type: '待办',
    }, {
      id: '000000018',
      title: 'ABCD 版本发布',
      description: '冠霖提交于 2017-01-06，需在 2017-01-07 前完成代码变更任务',
      extra: '进行中',
      status: 'read',
      type: '待办',
    }, {
      id: '000000019',
      title: 'ABCD 版本发布',
      description: '冠霖提交于 2017-01-06，需在 2017-01-07 前完成代码变更任务',
      extra: '进行中',
      status: 'unread',
      type: '待办',
    }, {
      id: '000000021',
      title: 'ABCD 版本发布',
      description: '冠霖提交于 2017-01-06，需在 2017-01-07 前完成代码变更任务',
      extra: '进行中',
      status: 'read',
      type: '待办',
    }, {
      id: '000000022',
      title: 'ABCD 版本发布',
      description: '冠霖提交于 2017-01-06，需在 2017-01-07 前完成代码变更任务',
      extra: '进行中',
      status: 'read',
      type: '待办',
    }, {
      id: '000002012',
      title: 'ABCD 版本发布',
      description: '冠霖提交于 2017-01-06，需在 2017-01-07 前完成代码变更任务',
      extra: '进行中',
      status: 'read',
      type: '待办',
    }]
    return (
      <Popover
        content={ <NotificationsList data={data} /> }
        trigger="click"
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
      >
        <Icon type="bell"
          style={{ cursor: 'pointer', fontSize: 18, marginLeft: 28, verticalAlign: 'middle', marginTop: -2 }}
        />
      </Popover>
    )
  }
}

export { NotificationsAlertButton }



