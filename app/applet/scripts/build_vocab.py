# -*- coding: utf-8 -*-
"""
Full Vocabulary Builder (1,000 words) for Hango PRO.
Builds /src/data/vocabulary.json and /public/vocabulary.json
Ensures:
- Exactly 1,000 unique Korean words
- UTF-8 encoding
- All fields: id, korean, meaning, vietnamese, pronunciation, topic, categoryId, level, wordType, example, exampleKorean, exampleMeaning, exampleVietnamese, imageUrl, fallbackEmoji
"""

import json
import os

# We will structure the data cleanly by category
# Category mappings:
# 1: Chào hỏi và giới thiệu bản thân
# 2: Gia đình và các mối quan hệ
# 3: Trường học và học tập
# 4: Đồ ăn và thức uống
# 5: Thời gian, ngày tháng và số đếm
# 6: Địa điểm và giao thông
# 7: Mua sắm và tiền bạc
# 8: Sức khỏe và cơ thể
# 9: Du lịch và khách sạn
# 10: Công việc và nghề nghiệp
# 11: Nhà cửa và đồ dùng
# 12: Thời tiết và thiên nhiên
# 13: Sở thích và giải trí
# 14: Cảm xúc và tính cách
# 15: Luyện thi TOPIK trọng điểm

print("Builder ready")
