/**
 * 예약 항목 인터페이스
 * 예약에 포함된 각 서비스 항목
 */
export interface ReservationItem {
  serviceId: string;        // 서비스 ID
  name: string;             // 서비스 이름
  price: number;            // 단가
  quantity: number;         // 수량
}

/**
 * 예약 메타데이터 인터페이스
 * 유연한 추가 정보 저장
 */
export interface ReservationMetadata {
  specialRequests?: string;                    // 특이 요청사항
  hasElevator?: boolean;                       // 엘리베이터 유무
  garbageQuantity?: 'small' | 'medium' | 'large';  // 쓰레기 양
  petInfo?: {
    type: string;
    name: string;
    notes?: string;
  };
  accessCode?: string;                         // 진입 코드
  parkingInfo?: string;                        // 주차 정보
  contactPerson?: string;                      // 현장 담당자
  floorNumber?: number;                        // 층수
  buildingType?: string;                       // 건물 유형
  [key: string]: any;                          // 향후 확장용
}

/**
 * 고객 메타데이터 인터페이스
 */
export interface CustomerMetadata {
  preferredCleaningStyle?: 'light' | 'standard' | 'thorough';
  hasPets?: boolean;
  petDetails?: Array<{
    type: string;
    name: string;
    allergyNote?: string;
  }>;
  notes?: string;
  preferredTimeSlot?: 'morning' | 'afternoon' | 'evening';
  subscriptionStatus?: 'active' | 'inactive';
  loyaltyPoints?: number;
  [key: string]: any;                          // 향후 확장용
}
