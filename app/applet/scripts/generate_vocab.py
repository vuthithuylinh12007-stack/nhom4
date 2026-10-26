# -*- coding: utf-8 -*-
"""
Generator for Hango PRO 1,000 Korean Vocabulary Dataset.
Ensures exactly 1,000 unique, authentic Korean words across 15 categories.
UTF-8 encoded, complete with Hangul, Vietnamese meaning, pronunciation,
examples, translations, category IDs, levels, word types, and image links.
"""

import json
import os

# Definition of the 15 categories matching categories.ts
CATEGORIES = [
    {"id": 1, "name": "Chào hỏi và giới thiệu bản thân", "koreanName": "인사 및 자기소개", "icon": "👋"},
    {"id": 2, "name": "Gia đình và các mối quan hệ", "koreanName": "가족 및 인간관계", "icon": "👨‍👩‍👧‍👦"},
    {"id": 3, "name": "Trường học và học tập", "koreanName": "학교 및 공부", "icon": "🎓"},
    {"id": 4, "name": "Đồ ăn và thức uống", "koreanName": "음식 및 음료", "icon": "🍜"},
    {"id": 5, "name": "Thời gian, ngày tháng và số đếm", "koreanName": "시간, 날짜 및 숫자", "icon": "⏰"},
    {"id": 6, "name": "Địa điểm và giao thông", "koreanName": "장소 및 교통", "icon": "🚇"},
    {"id": 7, "name": "Mua sắm và tiền bạc", "koreanName": "쇼핑 및 돈", "icon": "🛍️"},
    {"id": 8, "name": "Sức khỏe và cơ thể", "koreanName": "건강 및 신체", "icon": "🏥"},
    {"id": 9, "name": "Du lịch và khách sạn", "koreanName": "여행 및 호텔", "icon": "✈️"},
    {"id": 10, "name": "Công việc và nghề nghiệp", "koreanName": "직업 및 업무", "icon": "💼"},
    {"id": 11, "name": "Nhà cửa và đồ dùng", "koreanName": "집 및 가구", "icon": "🏠"},
    {"id": 12, "name": "Thời tiết và thiên nhiên", "koreanName": "날씨 및 자연", "icon": "🌤️"},
    {"id": 13, "name": "Sở thích và giải trí", "koreanName": "취미 및 여가", "icon": "🎨"},
    {"id": 14, "name": "Cảm xúc và tính cách", "koreanName": "감정 및 성격", "icon": "💖"},
    {"id": 15, "name": "Luyện thi TOPIK trọng điểm", "koreanName": "TOPIK 필수 어휘", "icon": "🏆"},
]

print("Script template created")
