import { Avatar, Icon, List, Popover, Tooltip } from 'antd'
import React from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import 'regenerator-runtime/runtime'
import { groupAvatarColors } from 'util.js'

import { getCoterieUUID } from './home_page/common.jsx'

class GroupAvatarWrapper extends React.Component {
  render() {
    if (this.props.coterie.avatarUrl !== undefined) {
      return (
        <Avatar
          src={this.props.coterie.avatarUrl}
          style={{
            verticalAlign: 'middle',
            background: 'white',
            marginLeft: '10px',
            marginRight: '5px',
          }}
        />
      )
    } else if (this.props.coterie.icon !== undefined) {
      return (
        <Avatar
          icon={this.props.coterie.icon}
          style={{ verticalAlign: 'middle', marginLeft: '10px', marginRight: '5px' }}
        />
      )
    } else {
      const color = groupAvatarColors[this.props.coterie.uuid.charCodeAt(0) % 8]
      return (
        <Avatar
          style={{
            backgroundColor: color,
            verticalAlign: 'middle',
            marginLeft: '10px',
            marginRight: '5px',
          }}
        >
          <span style={{ position: 'initial' }}>
            {this.props.coterie.name.slice(0, 2).toUpperCase()}
          </span>
        </Avatar>
      )
    }
  }
}

class GroupDetailsWrapper extends React.Component {
  render() {
    const description = this.props.coterie.description
    const name = this.props.coterie.name
    const group_uuid = this.props.uuid ? '/groups/' + this.props.uuid + '/' : '/'

    return (
      <Link to={group_uuid}>
        <div style={{ cursor: 'pointer' }}>
          <div className={'group-name'}>{name}</div>
          {description.length === 0 ? null : (
            <div className='notification-alert-list-wrapper' title={description}>
              {description}
            </div>
          )}
          {/*<TimeAgo style={{color: '#91959d'}} date={this.state.newNotification.timestamp} />*/}
        </div>
      </Link>
    )
  }
}

class GroupsList extends React.Component {
  constructor(props) {
    super(props)

    this.showModal = () => {
      this.setState({
        visible: true,
      })
    }

    this.onClickRow = (record, index, event) => {
      if (record.callback !== undefined) {
        record.callback()
      } else {
        // window.location.href = `/groups/${record.uuid}/`
      }
    }
    this.state = {
      createGroupModelVisible: false,
    }
    this.setCreateCoterieModelVisible = visibility => {
      this.setState({ createGroupModelVisible: visibility })
    }
  }

  render() {
    const publicCoterie = [
      {
        uuid: undefined,
        name: <FormattedMessage id='app.group.public' defaultMessage='Public' />,
        description: (
          <FormattedMessage
            id='app.group.message.public_content_visible'
            defaultMessage='Public content is visible by all users'
          />
        ),

        avatarUrl: '/media/logo.png',
      },
    ]

    const createNewGroupFakeItem = {
      uuid: 'fake',
      name: 'New Group',
      description: (
        <FormattedMessage
          id='app.group.message.create_new_group'
          defaultMessage='Click to create a new group'
        />
      ),
      icon: 'plus-square-o',
      callback: () => {
        this.setCreateCoterieModelVisible(true)
      },
    }

    return (
      <div>
        <List
          itemLayout='horizontal'
          dataSource={publicCoterie}
          style={{ maxHeight: '66vh', overflowY: 'auto' }}
          size='large'
          renderItem={item => (
            <List.Item key={item.slug}>
              <List.Item.Meta
                avatar={
                  <Avatar src={item.avatarUrl} style={{ marginLeft: '10px', marginRight: '5px' }} />
                }
                title={item.name}
                description={item.description}
              />
            </List.Item>
          )}
        />

        <List
          itemLayout='horizontal'
          dataSource={this.props.administratedCoteries.concat([createNewGroupFakeItem])}
          style={{ maxHeight: '66vh', overflowY: 'auto', width: '300px' }}
          size='large'
          header={
            <span style={{ height: 18 }}>
              <FormattedMessage id='app.group.as_member' defaultMessage='As member' />
            </span>
          }
          locale={{
            emptyText: (
              <FormattedMessage id='app.group.message.no_data' defaultMessage='No data found' />
            ),
          }}
          renderItem={item => (
            <List.Item key={item.slug}>
              <List.Item.Meta
                avatar={<GroupAvatarWrapper coterie={item} />}
                title={item.name}
                description={item.description}
              />
            </List.Item>
          )}
        />

        <List
          itemLayout='horizontal'
          dataSource={this.props.joinedCoteries}
          style={{ maxHeight: '66vh', overflowY: 'auto' }}
          size='large'
          header={
            <span style={{ height: 18 }}>
              <FormattedMessage id='app.group.as_member' defaultMessage='As member' />
            </span>
          }
          locale={{
            emptyText: (
              <FormattedMessage id='app.group.message.no_data' defaultMessage='No data found' />
            ),
          }}
          renderItem={item => (
            <List.Item key={item.slug}>
              <List.Item.Meta
                avatar={<GroupAvatarWrapper coterie={item} />}
                title={item.name}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </div>
    )
  }
}

class GroupSelectionButton extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      length: undefined,
      show: false,
      data: undefined,
      createGroupModelVisible: false,
    }
    this.handleVisibleChange = visible => {
      this.setState({ visible })
    }
  }

  componentDidMount() {
    // axios.get('/coterie/api/coteries').then((response) => {
    //   this.setState({
    //     administratedCoteries: response.data.administratedCoteries,
    //     joinedCoteries: response.data.joinedCoteries
    //   })
    // })
  }

  render() {
    var iconToShow = (
      <Icon
        type='team'
        // onClick={() => {
        //   notification['info']({message: 'We are rewriting the group function, it will come soon.'})
        // }}
        style={{ cursor: 'pointer', fontSize: 18, marginLeft: 28, verticalAlign: 'middle' }}
      />
    )

    // if (this.props.currentCoterieUUID !== undefined) {
    //   var currentCoterie = undefined
    //
    //   var filtered = this.props.administratedCoteries.filter(c => c.uuid === this.props.currentCoterieUUID)
    //   if (filtered.length > 0)
    //     currentCoterie = filtered[0]
    //
    //   filtered = this.props.joinedCoteries.filter(c => c.uuid === this.props.currentCoterieUUID)
    //   if (filtered.length > 0)
    //     currentCoterie = filtered[0]
    //
    //   if (currentCoterie !== undefined) {
    //     const color = groupAvatarColors[this.props.currentCoterieUUID.charCodeAt(0) % 8]
    //     iconToShow = (
    //       <Avatar style={{ cursor: 'pointer', marginLeft: 28, backgroundColor: color, verticalAlign: 'middle' }} size='small'>
    //         <span style={{position: 'initial'}}>{currentCoterie.name.slice(0, 2).toUpperCase()}</span>
    //       </Avatar>
    //     )
    //   }
    // }

    return (
      <Popover
        content={
          <GroupsList
            administratedCoteries={this.props.administratedCoteries}
            joinedCoteries={this.props.joinedCoteries}
            currentCoterieUUID={getCoterieUUID()}
            updateUUIDCallback={this.props.updateUUIDCallback}
            fields={this.props.fields}
          />
        }
        trigger='click'
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
        placement='bottom'
      >
        {/*{iconToShow}*/}
        <Tooltip
          title={
            <FormattedMessage
              id='app.group.message.visible_within_group'
              defaultMessage='Documents and discussion inside a group is not visible to the world'
            />
          }
        >
          <a href='#'>
            <Icon type='info-circle-o' style={{ marginRight: 6, verticalAlign: 'middle' }} />
          </a>
        </Tooltip>

        <span
          style={{
            fontWeight: 400,
            color: '#666',
            cursor: 'pointer',
            verticalAlign: 'middle',
            marginRight: 6,
          }}
        >
          <FormattedMessage id='app.group.groups' defaultMessage='Groups' />
        </span>
        <Icon
          style={{ fontSize: 8, cursor: 'pointer', verticalAlign: 'middle' }}
          type='caret-down'
        />
      </Popover>
    )
  }
}

export { GroupSelectionButton }
