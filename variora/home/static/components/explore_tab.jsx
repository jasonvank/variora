import { Avatar, Button, Card, Col, Icon, Layout, Menu, Row, Tabs, Table, notification } from 'antd'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom'

import React from 'react'
import { connect } from 'react-redux'
import { fetchExploreDocs, fetchExploreReadlists } from '../redux/actions.js'
import { FormattedMessage, FormattedRelative } from 'react-intl'
const { Content } = Layout
const TabPane = Tabs.TabPane

const SUB_URL_BASE = '/explore'

class DocumentListWrapper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: this.props.data,
    }
    this.handleClick = () => {
      this.setState({ loading: !this.state.loading })
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
    })
    this.forceUpdate()
  }

  render() {
    return this.state.data == undefined
      ? []
      : this.state.data.map(item => (
          <div
            key={item.open_url}
            className='gutter-example'
            style={{ textAlign: 'center', margin: 40 }}
          >
            <Col>
              <Card
                style={{ width: 200 }}
                className='custome-card-cover'
                bodyStyle={{ padding: 0 }}
              >
                <div className='custom-image'>
                  <a target='_blank' href={item.open_url}>
                    <img width='100%' height='240' src={item.image} />
                  </a>
                </div>
                <div className='custom-card'>
                  <h3 className='custom-card-text-wrapper' title={item.title}>
                    {item.title}
                  </h3>
                  <p style={{ color: '#91959d' }}>
                    <FormattedRelative value={item.upload_time} />
                  </p>
                </div>
              </Card>
            </Col>
          </div>
        ))
  }
}

class DisplayDocuments extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: this.props.data,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
    })
  }

  render() {
    return (
      <div className='card' style={{ overflow: 'auto', color: 'white' }}>
        <Row type='flex' justify='start'>
          <DocumentListWrapper data={this.state.data} />{' '}
        </Row>
      </div>
    )
  }
}

class ReadlistTab extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      mostCollectedReadlists: this.props.data.mostCollectedReadlists,
      newestReadlists: this.props.data.newestReadlists,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      mostCollectedReadlists: nextProps.data.mostCollectedReadlists,
      newestReadlists: nextProps.data.newestReadlists,
    })
  }

  render() {
    const columns = [
      {
        dataIndex: 'space',
        width: '2%',
      },
      {
        title: '#',
        dataIndex: 'id',
        width: '5%',
        render: (text, record) => (
          <img
            width={18}
            src={
              'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678072-folder-document-512.png'
            }
          />
        ), // this.state.mostCollectedReadlists.indexOf(record) + 1
      },
      // {
      //   dataIndex: 'trending',
      //   width: '3%',
      //   render: (text, record) => {
      //     return record.rankingChange
      //     // <Icon type="arrow-up" style={{ fontSize: 16, color: '#e67e22' }} />
      //   }
      // },
      {
        title: <FormattedMessage id='app.table.title' defaultMessage='Title' />,
        key: 'title',
        width: '30%',
        render: (text, record, index) => (
          <a
            className='document-link custom-card-text-wrapper'
            title={record.name}
            href={record.url}
          >
            {record.name}
          </a>
        ),
      },
      {
        title: <FormattedMessage id='app.table.creator' defaultMessage='Creator' />,
        render: (text, record) => (
          <span>
            <Avatar
              src={record.owner.portrait_url}
              style={{ verticalAlign: 'middle', marginRight: 12 }}
            />
            {record.owner.nickname}
          </span>
        ),
        width: '20%',
      },
      {
        title: <FormattedMessage id='app.table.uploaded_time' defaultMessage='Uploaded Time' />,
        key: 'uploaded_time',
        width: '15%',
        render: (text, record, index) => <FormattedRelative value={record.create_time} />,
      },
    ]

    const columns2 = columns.slice()
    // columns2.splice(2, 1)
    columns2[1] = {
      title: '#',
      dataIndex: 'id',
      width: '5%',
      render: (text, record) => (
        <img
          width={18}
          src={
            'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678072-folder-document-512.png'
          }
        />
      ), // this.state.newestReadlists.indexOf(record) + 1
    }

    return (
      <div style={{ paddingBottom: 60 }}>
        <div className='card' style={{ overflow: 'auto', color: 'white', marginTop: 18 }}>
          <div className='card-header pubIndex-recommendationsHeader'>
            <div className='card-headerText' style={{ color: 'black' }}>
              <FormattedMessage id='app.explore.trending_lists' defaultMessage='Trending Lists' />
            </div>
          </div>
          <Table
            className='notification-table'
            dataSource={this.state.mostCollectedReadlists}
            columns={columns}
            pagination={false}
            showHeader={false}
            style={{ overflowY: 'auto' }}
            rowKey={record => record.slug}
            footer={() => null}
          />
        </div>

        <div className='card' style={{ overflow: 'auto', color: 'white', marginTop: 18 }}>
          <div className='card-header pubIndex-recommendationsHeader'>
            <div className='card-headerText' style={{ color: 'black' }}>
              <FormattedMessage id='app.explore.recent_lists' defaultMessage='Recent Listss' />
            </div>
          </div>
          <Table
            className='notification-table'
            dataSource={this.state.newestReadlists}
            columns={columns2}
            pagination={false}
            showHeader={false}
            style={{ overflowY: 'auto' }}
            rowKey={record => record.slug}
            footer={() => null}
          />
        </div>
      </div>
    )
  }
}

class DocumentTab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: this.props.data,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
    })
  }

  render() {
    return (
      <div style={{ paddingBottom: 60 }}>
        <div className='card' style={{ overflow: 'auto', color: 'white', marginTop: 18 }}>
          <div className='card-header pubIndex-recommendationsHeader'>
            <div className='card-headerText' style={{ color: 'black' }}>
              <FormattedMessage id='app.explore.most_views' defaultMessage='Most Views' />
            </div>
          </div>
          {<DisplayDocuments data={this.state.data.mostViewsDocuments} />}
        </div>

        <div className='card' style={{ overflow: 'auto', color: 'white', marginTop: 18 }}>
          <div className='card-header pubIndex-recommendationsHeader'>
            <div className='card-headerText' style={{ color: 'black' }}>
              <FormattedMessage
                id='app.explore.most_annotations'
                defaultMessage='Most Annotations'
              />
            </div>
          </div>
          {<DisplayDocuments data={this.state.data.mostAnnotationsDocuments} />}
        </div>

        <div className='card' style={{ overflow: 'auto', color: 'white', marginTop: 18 }}>
          <div className='card-header pubIndex-recommendationsHeader'>
            <div className='card-headerText' style={{ color: 'black' }}>
              <FormattedMessage id='app.explore.most_stars' defaultMessage='Most Stars' />
            </div>
          </div>
          {<DisplayDocuments data={this.state.data.mostStarsDocuments} />}
        </div>
      </div>
    )
  }
}

class ExploreTabBeforeConnect extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    if (this.props.mostViewsDocuments == undefined) this.props.fetchExploreDocs()

    if (this.props.mostCollectedReadlists == undefined) this.props.fetchExploreReadlists()
  }

  render() {
    const path = window.location.href
    return (
      <Content
        style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 16, margin: 0, minHeight: 280 }}
      >
        <Menu
          onClick={this.handleClick}
          className={'card'}
          mode='horizontal'
          style={{ padding: 0 }}
          defaultSelectedKeys={['documents']}
          selectedKeys={path.includes('readlists') ? ['readlists'] : ['documents']}
        >
          <Menu.Item key='documents'>
            <Link to={SUB_URL_BASE}>
              <Icon type='file' />
              <FormattedMessage id='app.explore.documents' defaultMessage='Documents' />
            </Link>
          </Menu.Item>
          <Menu.Item key='readlists'>
            <Link to={SUB_URL_BASE + '/readlists'}>
              <Icon type='folder-open' />
              <FormattedMessage id='app.explore.readlists' defaultMessage='Readlists' />
            </Link>
          </Menu.Item>
        </Menu>
        <Switch>
          <Route exact path={SUB_URL_BASE} render={() => <DocumentTab data={this.props} />} />
          <Route
            path={SUB_URL_BASE + '/readlists'}
            render={() => <ReadlistTab data={this.props} />}
          />
        </Switch>
      </Content>
    )
  }
}

const mapStoreToProps = (store, ownProps) => {
  return {
    ...ownProps,
    ...store,
  }
}
const ExploreTab = connect(
  mapStoreToProps,
  { fetchExploreDocs, fetchExploreReadlists },
)(ExploreTabBeforeConnect)
export { ExploreTab }
