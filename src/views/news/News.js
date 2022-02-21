import React, {useEffect, useState} from 'react';
import axios from "axios";
import {Card, Col, List, PageHeader, Row} from "antd";
import _ from 'lodash'

function News(props) {
    const [list, setList] = useState([])
    useEffect(() => {
        axios.get(`/news?publishState=2&_expand=category`).then(res => {
            setList(Object.entries(_.groupBy(res.data, item => item.category.title)));
        })
    })
    return (
        <div style={{
            width: "95%",
        }}>
            <PageHeader
                className="site-page-header"
                title="全球新闻"
                subTitle="查看新闻"
            />
            <Row gutter={[16, 16]}>
                {
                    list.map(item => {
                        return <Col span={8} key={item[0]}>
                            <Card title={item[0]} bordered={true} hoverable={true}>
                                <List
                                    size="small"
                                    bordered
                                    dataSource={item[1]}
                                    pagination={{
                                        pageSize: 3,
                                    }}
                                    renderItem={data => <List.Item><a
                                        href={`#/detail/${data.id}`}>{data.title}</a></List.Item>}
                                />
                            </Card>
                        </Col>
                    })
                }
            </Row>
        </div>
    );
}

export default News;