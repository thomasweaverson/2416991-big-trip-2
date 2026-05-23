import ApiService from '../framework/api-service';
import { EndPoints } from '../utils/api';

export default class OffersApiService extends ApiService {
  get offers() {
    return this._load({ url: EndPoints.OFFERS })
      .then(ApiService.parseResponse);
  }
}
