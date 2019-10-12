import $ from 'jquery'

var currentTask

function singleProductAddToCart(wrapper) {
  if (!$) return

  var form = wrapper.closest('form')
  var button = form.find('.button')
  var formUrl = form.attr('action')
  var formMethod = form.attr('method')

  if (typeof formMethod === 'undefined' || formMethod == '') {
    formMethod = 'POST'
  }

  var formData = new FormData(form[0])
  formData.append(button.attr('name'), button.val())

  if (form.closest('.quick-view-modal').length) {
    form
      .closest('.quick-view-modal')
      .find('.ct-quick-add')
      .removeClass('added')

    form
      .closest('.quick-view-modal')
      .find('.ct-quick-add')
      .addClass('loading')
  }

  button.removeClass('added')
  button.addClass('loading')

  // Trigger event.
  $(document.body).trigger('adding_to_cart', [button, {}])

  currentTask = $.ajax({
    url: formUrl,
    method: formMethod,
    data: formData,
    cache: false,
    contentType: false,
    processData: false
  })
    .done((data, textStatus, jqXHR) => {
      $(document.body).trigger('wc_fragment_refresh')

      $.ajax({
        url: wc_cart_fragments_params.wc_ajax_url
          .toString()
          .replace('%%endpoint%%', 'get_refreshed_fragments'),
        type: 'POST',
        success: data => {
          if (data && data.fragments) {
            $.each(data.fragments, function(key, value) {
              $(key).replaceWith(value)
            })

            $(document.body).trigger('wc_fragments_refreshed')
          }

          if (form.closest('.quick-view-modal').length) {
            form
              .closest('.quick-view-modal')
              .find('.ct-quick-add')
              .addClass('added')

            form
              .closest('.quick-view-modal')
              .find('.ct-quick-add')
              .removeClass('loading')
          }

          $(document.body).trigger('added_to_cart', [
            data.fragments,
            data.cart_hash,
            button,
            formData.get('quantity')
          ])
        }
      })
    })
    .fail(() => {
      button.removeClass('loading')
    })
    .always(function(jqXHR, textStatus, errorThrown) {
      // $('.cart').off('submit')
      // listenAddToCart()
    })
}

function listenAddToCart(force = false) {
  if (!$) return

  $('.cart')
    .toArray()
    .map(el => {
      if (el.closest('.product-type-external')) {
        return
      }

      if (el.hasAddToCartListener) {
        return
      }

      el.hasAddToCartListener = true

      $(el).on('submit', function(e) {
        e.preventDefault()
        singleProductAddToCart($(this))
      })
    })

  $('.quick-view-modal .ct-quick-add')
    .toArray()
    .map(el => {
      if (el.hasAddToCartListener) {
        return
      }
      el.hasAddToCartListener = true
      $(el).on('click', function(e) {
        e.preventDefault()

        if (el.closest('.product-type-external')) {
          el.closest('.product-type-external')
            .querySelector('.cart')
            .submit()

          return
        }

        singleProductAddToCart(
          $(this)
            .closest('.quick-view-modal')
            .find('.cart')
        )
      })
    })
}

export const mount = () => listenAddToCart()
