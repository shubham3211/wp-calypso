/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { isEmpty, trim } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import analytics from 'lib/analytics';
import { applyCoupon } from 'lib/upgrades/actions';

export class CartCoupon extends React.Component {
	static displayName = 'CartCoupon';

	constructor( props ) {
		super( props );

		this.state = {
			isCouponFormShowing: false,
			couponInputValue: this.appliedCouponCode,
			userChangedCoupon: false,
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! this.state.userChangedCoupon ) {
			this.setState( { couponInputValue: nextProps.cart.coupon } );
		}
	}

	render() {
		if ( this.appliedCouponCode ) {
			return this.renderAppliedCoupon();
		}

		return this.renderApplyCouponUI();
	}

	get appliedCouponCode() {
		return this.props.cart.is_coupon_applied && this.props.cart.coupon;
	}

	renderAppliedCoupon() {
		return (
			<div className="cart-coupon">
				<span className="cart__details">
					{ this.props.translate( 'Coupon applied: %(coupon)s', {
						args: { coupon: this.appliedCouponCode },
					} ) }
				</span>{' '}
				<a href="" onClick={ this.clearCoupon } className="cart__remove-link">
					{ this.props.translate( 'Remove' ) }
				</a>
			</div>
		);
	}

	renderApplyCouponUI() {
		if ( this.props.cart.total_cost === 0 ) {
			return;
		}

		return (
			<div className="cart-coupon">
				<a href="" onClick={ this.toggleCouponDetails } className="cart__toggle-link">
					{ this.props.translate( 'Have a coupon code?' ) }
				</a>

				{ this.renderCouponForm() }
			</div>
		);
	}

	renderCouponForm = () => {
		if ( ! this.state.isCouponFormShowing ) {
			return;
		}

		return (
			<form onSubmit={ this.applyCoupon } className={ 'cart__form' }>
				<input
					type="text"
					disabled={ this.isSubmitting }
					placeholder={ this.props.translate( 'Enter Coupon Code', { textOnly: true } ) }
					onChange={ this.handleCouponInputChange }
					value={ this.state.couponInputValue }
					autoFocus // eslint-disable-line jsx-a11y/no-autofocus
				/>
				<Button
					type="submit"
					disabled={ isEmpty( trim( this.state.couponInputValue ) ) }
					busy={ this.isSubmitting }
				>
					{ this.props.translate( 'Apply' ) }
				</Button>
			</form>
		);
	};

	get isSubmitting() {
		return ! this.props.cart.is_coupon_applied && this.props.cart.coupon;
	}

	toggleCouponDetails = event => {
		event.preventDefault();

		this.setState( { isCouponFormShowing: ! this.state.isCouponFormShowing } );

		if ( this.state.isCouponFormShowing ) {
			analytics.ga.recordEvent( 'Upgrades', 'Clicked Hide Coupon Code Link' );
		} else {
			analytics.ga.recordEvent( 'Upgrades', 'Clicked Show Coupon Code Link' );
		}
	};

	clearCoupon = event => {
		event.preventDefault();
		this.setState(
			{
				couponInputValue: '',
				isCouponFormShowing: false,
			},
			() => {
				this.applyCoupon( event );
			}
		);
	};

	applyCoupon = event => {
		event.preventDefault();
		if ( this.isSubmitting ) {
			return;
		}

		analytics.tracks.recordEvent( 'calypso_checkout_coupon_submit', {
			coupon_code: this.state.couponInputValue,
		} );

		applyCoupon( this.state.couponInputValue );
	};

	handleCouponInputChange = event => {
		this.setState( {
			userChangedCoupon: true,
			couponInputValue: event.target.value,
		} );
	};
}

export default localize( CartCoupon );
