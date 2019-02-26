import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  Optional,
  Inject,
  InjectionToken,
  OnDestroy,
  AfterViewInit,
  ChangeDetectionStrategy,
} from '@angular/core'

import { catchError } from 'rxjs/operators'
import {
  PaystackRequestContract,
  PaystackResponseContract,
} from './paystack.contract'
import { empty } from 'rxjs'

import { HttpClient } from '@angular/common/http';
import { Script, ScriptLoaderService } from './script-loader.service';

interface PayStackWindow extends Window {
  PaystackPop: {
    setup: (parameters: PaystackRequestContract) => { openIframe: Function, [key: string]: any },
    [key: string]: any
  }
}

declare var window: Partial<PayStackWindow>

export const NG_PAYSTACK_DATA = new InjectionToken<{}>('NG_PAYSTACK_DATA')
export const PAYSTACK_RESPONSE = 'PAYSTACK_RESPONSE'

@Component({
  selector: 'ng-paystack',
  templateUrl: './paystack.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaystackComponent implements OnInit, OnDestroy, AfterViewInit {

  /**
   * Input provision for configuration object
   */
  @Input() request: PaystackRequestContract

  /**
   * this event is dispatched when payment is successful
   */
  @Output() success: EventEmitter<PaystackResponseContract> = new EventEmitter<PaystackResponseContract>()

  /**
   * dispatched when any error occurs during processing
   */
  @Output() failure: EventEmitter<PaystackResponseContract> = new EventEmitter<PaystackResponseContract>()

  private paystackScript: any

  constructor(
    private loader: ScriptLoaderService,
    private http: HttpClient,
    @Optional() @Inject(NG_PAYSTACK_DATA) private data: PaystackRequestContract,
  ) {
    this.request = this.request ? this.request : this.data
    console.info('conponent init', this.request)
  }

  ngOnInit() { 
    console.info('init', this.request)
  }

  ngAfterViewInit() {
    console.info('after view init', this.request)
    if(this.request.type == 'embed'){
      this.payEmbed()
    }
  }

  /**
   * Handle embed payment
   * Triggered after view have been initialized
   */
  payEmbed(paymentRequest?: PaystackRequestContract){
    this.pay({
      ...paymentRequest,
      ...{
        container: 'paystack-embed-container',
        callback: (response: PaystackResponseContract) => {
          this.success.emit({ ...response, ...{ verified: false } })
          console.log('Payment successful, but yet to be verified. You might be contacted if their is any issue with your payment.')
        },
      },
      ...this.request
    })
  }

  /**
   * Handle inline payment
   * Triggered by the pay button displayed to the user 
   */
  payInline(paymentRequest: PaystackRequestContract){
    this.pay({
      ...paymentRequest,
      ...{
        callback: (response: PaystackResponseContract) => {
          response = { ...response, ...{ verified: false } }
          this.success.emit(response)
          console.log('Payment successful, but yet to be verified. You might be contacted if their is any issue with your payment.')
        },
      },
      ...this.request,
    })
  }

  /**
   * auto load Paystack JavaScript library
   * Initiate payment 
   * and verify payment
   */
  pay(paymentReqeust: PaystackRequestContract){

    // auto load Paystack JavaScript library
    this.paystackScript = this.loader.load({
      name: 'Paystack',
      src: 'https://js.paystack.co/v1/inline.js',
      loaded: false,
    })
    .pipe(
      catchError((e) => {
        console.error(
          'Cannot load PaystackPop as a member of window object. Verify that https://js.paystack.co/v1/inline.js loaded correctly.',
        )
        return empty()
      }),
    )
    .subscribe((script: Script) => {
      // load paymnet flow after library have been successfully loaded
      let paymentHandler = window.PaystackPop.setup(paymentReqeust)

      // run only for inline payment flow
      if(this.request.type == 'inline'){
        paymentHandler.openIframe()
      }

    })

  }

  /**
   * release resources
   */
  ngOnDestroy() {
    console.info('component destroyed', this.request)
    this.paystackScript.unsubscribe()
    window.PaystackPop = null
  }

}
