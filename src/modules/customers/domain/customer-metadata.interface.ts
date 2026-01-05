/**
 * 고객 메타데이터 인터페이스
 * 업체별 커스텀 정보 저장
 */
export interface CustomerMetadata {
  preferredCleaningStyle?: 'light' | 'standard' | 'thorough'; // 선호 청소 스타일
  hasPets?: boolean; // 반려동물 보유 여부
  petDetails?: Array<{
    type: string; // 반려동물 종류
    name: string; // 반려동물 이름
    allergyNote?: string; // 알레르기 정보
  }>;
  notes?: string; // 일반 메모
  preferredTimeSlot?: 'morning' | 'afternoon' | 'evening'; // 선호 시간대
  subscriptionStatus?: 'active' | 'inactive'; // 구독 상태
  loyaltyPoints?: number; // 충성도 포인트
  hasParking?: boolean; // 주차 가능 여부
  buildingType?: string; // 건물 유형 (주택, 오피스 등)
  [key: string]: any; // 향후 확장용
}
