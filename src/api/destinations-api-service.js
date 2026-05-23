import ApiService from '../framework/api-service';
import { EndPoints } from '../utils/api';

export default class DestinationsApiService extends ApiService {
  get destinations() {
    return this._load({ url: EndPoints.DESTINATIONS })
      .then(ApiService.parseResponse);
  }
}
