import bleach
from bleach.sanitizer import ALLOWED_TAGS, ALLOWED_ATTRIBUTES, ALLOWED_STYLES, ALLOWED_PROTOCOLS

updated_allowed_attributes = ALLOWED_ATTRIBUTES
updated_allowed_attributes.update({
    '*': ['style', 'src', 'width', 'height', 'alt'],
})

def sanitize(s):
    return bleach.clean(
        text=s,
        tags=ALLOWED_TAGS + [
            'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'br',
            'img', 'pre', 'sup', 'span'
        ],
        attributes=updated_allowed_attributes,
        styles=ALLOWED_STYLES + [
            'color', 'text-decoration', 'margin', 'margin-left', 'padding', 'padding-left'
        ],
        protocols=ALLOWED_PROTOCOLS + ['data']
    )
