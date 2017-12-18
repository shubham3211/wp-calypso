/** @format */

/**
 * External dependencies
 */

import React from 'react';
import i18n from 'i18n-calypso';
import page from 'page';

/**
 * Internal Dependencies
 */
import route from 'lib/route';
import analytics from 'lib/analytics';
import titlecase from 'to-title-case';
import { canAccessWordads } from 'lib/ads/utils';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import Ads from 'my-sites/ads/main';
import { canCurrentUser } from 'state/selectors';

function _recordPageView( context, analyticsPageTitle ) {
	var basePath = route.sectionify( context.path );
	if ( 'undefined' !== typeof context.params.section ) {
		analyticsPageTitle += ' > ' + titlecase( context.params.section );
	}

	analytics.ga.recordPageView( basePath + '/:site', analyticsPageTitle );
}

function _getLayoutTitle( context ) {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const title = isJetpackSite( state, siteId ) ? 'Ads' : 'WordAds';
	switch ( context.params.section ) {
		case 'earnings':
			return i18n.translate( '%(wordads)s Earnings', { args: { wordads: title } } );
		case 'settings':
			return i18n.translate( '%(wordads)s Settings', { args: { wordads: title } } );
	}
}

export default {
	redirect: function( context ) {
		page.redirect( '/ads/earnings/' + context.params.site_id );
		return;
	},

	layout: function( context, next ) {
		const state = context.store.getState();

		const site = getSelectedSite( state );
		const siteId = getSelectedSiteId( state );

		const pathSuffix = site ? '/' + site.slug : '';
		const layoutTitle = _getLayoutTitle( context );

		context.store.dispatch( setTitle( layoutTitle ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

		if ( ! canCurrentUser( state, siteId, 'manage_options' ) ) {
			page.redirect( '/stats' + pathSuffix );
			return;
		}

		if ( ! canAccessWordads( site ) ) {
			page.redirect( '/stats' + pathSuffix );
			return;
		}

		_recordPageView( context, layoutTitle );

		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}

		context.primary = React.createElement( Ads, {
			section: context.params.section,
			path: context.path,
		} );
		next();
	},
};
