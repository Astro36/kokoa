#!/usr/bin/env python
#-*- coding: utf-8 -*-

""" KokoaNLP
Copyright (C) 2018  Seungjae Park

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>. """

import getopt
import json
import multiprocessing
import os
import re
import sys
import requests
from bs4 import BeautifulSoup

output_path = os.getcwd()


def extract_text(element_title, element_content):
    title = element_title.get_text().strip()
    content = element_content.get_text() \
        .replace(u'// flash 오류를 우회하기 위한 함수 추가', '') \
        .replace(r'function _flash_removeCallback() {}', '')
    content = re.sub(r'\n+', ' ', content).strip()
    return (title, content)


def get_content(url):
    global output_path
    req = requests.get(url)
    html = req.text
    soup = BeautifulSoup(html, 'html.parser')
    selectors = (
        ('.article_header > .article_info > #articleTitle',
         '#articleBody > #articleBodyContents'),
        ('.content_area > .news_headline > .title', '.content_area > .news_end'),
        ('.end_ct > .end_ct_area > .end_tit',
         '.end_ct > .end_ct_area > .end_body_wrp > .article_body')
    )
    element_title = None
    element_content = None
    title = None
    content = None
    index = 0
    while element_title is None or element_content is None:
        element_title = soup.select_one(selectors[index][0])
        element_content = soup.select_one(selectors[index][1])
        index += 1
        if index >= len(selectors):
            break
    if element_title is not None and element_content is not None:
        title, content = extract_text(element_title, element_content)
        if title is not None and content is not None:
            print(title)
            f = open(u'{}/{}.json'.format(output_path,
                                          title.replace('/', ' ')), 'w')
            f.write(json.dumps({
                'url': url,
                'title': title,
                'content': content
            }, indent=4, ensure_ascii=False).encode('utf8'))
            f.close()
            return
    print(url)


if __name__ == '__main__':
    try:
        opts, args = getopt.getopt(
            sys.argv[1:],
            'ht:o:',
            ['help', 'type=', 'start=', 'start-id=', 'stop=', 'stop-id=', 'output='])
    except getopt.GetoptError as err:
        print(str(err))
        sys.exit(2)

    types = {
        u'경향신문': '032',
        u'국민일보': '005',
        u'동아일보': '020',
        u'문화일보': '021',
        u'서울신문': '081',
        u'세계일보': '022',
        u'조선일보': '023',
        u'중앙일보': '025',
        u'한겨레': '028',
        u'한국일보': '469'
    }
    type_name = None
    start_id = None
    stop_id = None
    urls = None

    for opt, arg in opts:
        if opt in ('-h', '--help'):
            sys.exit()
        elif opt in ('-t', '--type'):
            type_name = arg.decode('utf8')
        elif opt in ('--start', '--start-id'):
            start_id = int(arg)
        elif opt in ('--stop', '--stop-id'):
            stop_id = int(arg)
        elif opt in ('-o', '--output'):
            output_path = arg.decode('utf8')
        else:
            assert False, 'unhandled option'

    if type_name in types:
        type_id = types[type_name]
        if stop_id is None:
            req = requests.get(
                'http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid={}'.format(type_id))
            html = req.text
            soup = BeautifulSoup(html, 'html.parser')
            stop_id = int(soup.select_one(
                '.type06_headline > li > dl > dt > a')['href'].split('aid=')[1])
        urls = map(
            lambda article_id: 'http://news.naver.com/main/read.nhn?mode=LPOD&mid=sec&oid={}&aid={}'.format(
                type_id,
                str(article_id).rjust(10, '0')),
            range(start_id, stop_id + 1))
    else:
        print('Error: Can not find the type ID.')
        sys.exit(2)

    pool = multiprocessing.Pool(multiprocessing.cpu_count())
    pool.map(get_content, urls)

    f = open(u'{}/articles.json'.format(output_path), 'w')
    f.write(json.dumps({
        'type': type_name,
        'start_id': start_id,
        'stop_id': stop_id
    }, indent=4, ensure_ascii=False).encode('utf8'))
    f.close()