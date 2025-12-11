export interface NearbyResponse {
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  attractions: AttractionItem[];
}

export interface AttractionItem {
  contentId: number;
  title: string;
  sidoName: string;
  gugunName: string;
  contentTypeName: string;
  overview: string;
  firstImage: string;
  distance: number;
  shortsCount: number;
  latitude: number;
  longitude: number;
}

export interface SearchResponse {
  keyword: string;
  attractions: {
    content: SearchAttractionItem[];
    totalElements: number;
  };
}

export interface SearchAttractionItem {
  contentId: number;
  title: string;
  addr1: string;
  addr2?: string;
  firstImage: string;
  sidoName: string;
  gugunName: string;
  latitude: number;
  longitude: number;
  shortsCount: number;
}
export interface AttractionDetailResponse {
  contentId: number;
  title: string;
  addr1: string;
  addr2: string;
  zipcode: string;
  tel: string;
  firstImage: string;
  sidoName: string;
  gugunName: string;
  shortsCount: number;
  latitude: number;
  longitude: number;
  detail: {
    cat1: string;
    cat2: string;
    cat3: string;
    createdTime: string;
    modifiedTime: string;
    booktour: string;
  };
  description: {
    homepage: string;
    overview: string;
    telname: string;
  };
}
